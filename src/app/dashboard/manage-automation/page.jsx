// src/app/dashboard/manage-automation/page.jsx
"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

// Scraper Configuration Modal
const ScraperConfigModal = ({
  isOpen,
  onClose,
  onSave,
  scraperConfig,
  setScraperConfig,
  isSaving,
}) => {
  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setScraperConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectorChange = (index, field, value) => {
    const newSelectors = [...scraperConfig.selectors];
    newSelectors[index][field] = value;
    setScraperConfig((prev) => ({ ...prev, selectors: newSelectors }));
  };

  const addSelector = () => {
    setScraperConfig((prev) => ({
      ...prev,
      selectors: [
        ...prev.selectors,
        { name: "", selector: "", attribute: "text" },
      ],
    }));
  };

  const removeSelector = (index) => {
    const newSelectors = scraperConfig.selectors.filter((_, i) => i !== index);
    setScraperConfig((prev) => ({ ...prev, selectors: newSelectors }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Configure Web Scraper</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave();
          }}
          className="p-6"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scraper Name
              </label>
              <input
                type="text"
                name="name"
                value={scraperConfig.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Product Price Scraper"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target URL
              </label>
              <input
                type="url"
                name="url"
                value={scraperConfig.url}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/products"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Schedule (Cron Expression)
              </label>
              <input
                type="text"
                name="schedule"
                value={scraperConfig.schedule}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0 0 * * * (daily at midnight)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use cron format: minute hour day month day-of-week. Leave empty
                for manual execution only.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Selectors
              </label>
              <div className="space-y-2">
                {scraperConfig.selectors.map((selector, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={selector.name}
                      onChange={(e) =>
                        handleSelectorChange(index, "name", e.target.value)
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Field name"
                    />
                    <input
                      type="text"
                      value={selector.selector}
                      onChange={(e) =>
                        handleSelectorChange(index, "selector", e.target.value)
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="CSS selector"
                    />
                    <select
                      value={selector.attribute}
                      onChange={(e) =>
                        handleSelectorChange(index, "attribute", e.target.value)
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="text">Text</option>
                      <option value="href">Link (href)</option>
                      <option value="src">Image (src)</option>
                      <option value="alt">Alt Text</option>
                      <option value="data-price">Price</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeSelector(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addSelector}
                className="mt-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 text-sm"
              >
                Add Selector
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pagination (Optional)
              </label>
              <input
                type="text"
                name="paginationSelector"
                value={scraperConfig.paginationSelector}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="CSS selector for next page link"
              />
              <p className="text-xs text-gray-500 mt-1">
                If the data spans multiple pages, provide a selector for the
                next page link.
              </p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={scraperConfig.isActive}
                onChange={(e) =>
                  setScraperConfig((prev) => ({
                    ...prev,
                    isActive: e.target.checked,
                  }))
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="isActive"
                className="ml-2 block text-sm text-gray-700"
              >
                Active (will run according to schedule)
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {isSaving ? "Saving..." : "Save Scraper"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Results Modal
const ResultsModal = ({ isOpen, onClose, results, scraperName }) => {
  if (!isOpen) return null;

  const exportToJSON = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `${scraperName.replace(/\s+/g, "_")}_results.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const exportToCSV = () => {
    if (!results || results.length === 0) return;

    const headers = Object.keys(results[0]);
    const csvHeaders = headers.join(",");

    const csvRows = results.map((row) => {
      return headers
        .map((header) => {
          const value = row[header];
          return typeof value === "string" && value.includes(",")
            ? `"${value.replace(/"/g, '""')}"`
            : value;
        })
        .join(",");
    });

    const csvData = [csvHeaders, ...csvRows].join("\n");
    const dataUri =
      "data:text/csv;charset=utf-8," + encodeURIComponent(csvData);
    const exportFileDefaultName = `${scraperName.replace(/\s+/g, "_")}_results.csv`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            Scraping Results: {scraperName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600">
              Found {results.length} items
            </p>
            <div className="space-x-2">
              <button
                onClick={exportToJSON}
                className="px-3 py-1 bg-green-50 text-green-600 rounded-md hover:bg-green-100 text-sm"
              >
                Export JSON
              </button>
              <button
                onClick={exportToCSV}
                className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 text-sm"
              >
                Export CSV
              </button>
            </div>
          </div>

          {results.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(results[0]).map((key) => (
                      <th
                        key={key}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.map((item, index) => (
                    <tr key={index}>
                      {Object.values(item).map((value, i) => (
                        <td
                          key={i}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                          {typeof value === "string" &&
                          value.startsWith("http") ? (
                            <a
                              href={value}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {value.length > 30
                                ? `${value.substring(0, 30)}...`
                                : value}
                            </a>
                          ) : (
                            value
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No results found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Execution Log Modal
const ExecutionLogModal = ({ isOpen, onClose, logs }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Execution Logs</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {logs.length > 0 ? (
            <div className="space-y-2">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-md ${log.status === "success" ? "bg-green-50" : log.status === "error" ? "bg-red-50" : "bg-blue-50"}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {log.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${log.status === "success" ? "bg-green-100 text-green-800" : log.status === "error" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}
                    >
                      {log.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No logs available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ManageAutomation() {
  const [scrapers, setScrapers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [editingScraper, setEditingScraper] = useState(null);
  const [currentResults, setCurrentResults] = useState([]);
  const [currentLogs, setCurrentLogs] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const [scraperConfig, setScraperConfig] = useState({
    name: "",
    url: "",
    schedule: "",
    selectors: [{ name: "", selector: "", attribute: "text" }],
    paginationSelector: "",
    isActive: false,
  });

  useEffect(() => {
    fetchScrapers();
  }, []);

  const fetchScrapers = async () => {
    try {
      const response = await fetch("/api/scrapers");
      const data = await response.json();

      if (data.success) {
        setScrapers(data.data);
      } else {
        toast.error("Failed to fetch scrapers");
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching scrapers:", error);
      toast.error("Failed to fetch scrapers");
      setIsLoading(false);
    }
  };

  const openConfigModal = (scraper = null) => {
    if (scraper) {
      setEditingScraper(scraper);
      setScraperConfig({
        name: scraper.name,
        url: scraper.url,
        schedule: scraper.schedule || "",
        selectors: scraper.selectors || [
          { name: "", selector: "", attribute: "text" },
        ],
        paginationSelector: scraper.paginationSelector || "",
        isActive: scraper.isActive || false,
      });
    } else {
      setEditingScraper(null);
      setScraperConfig({
        name: "",
        url: "",
        schedule: "",
        selectors: [{ name: "", selector: "", attribute: "text" }],
        paginationSelector: "",
        isActive: false,
      });
    }
    setIsConfigModalOpen(true);
  };

  const saveScraper = async () => {
    setIsSaving(true);
    try {
      const url = editingScraper
        ? `/api/scrapers/${editingScraper._id}`
        : "/api/scrapers";

      const method = editingScraper ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scraperConfig),
      });

      if (response.ok) {
        toast.success(
          `Scraper ${editingScraper ? "updated" : "created"} successfully`,
        );
        setIsConfigModalOpen(false);
        fetchScrapers();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to save scraper");
      }
    } catch (error) {
      console.error("Error saving scraper:", error);
      toast.error("Failed to save scraper");
    } finally {
      setIsSaving(false);
    }
  };

  const runScraper = async (scraperId) => {
    setIsRunning(true);
    try {
      const response = await fetch(`/api/scrapers/${scraperId}/run`, {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Scraper executed successfully");
        setCurrentResults(data.results);
        setCurrentLogs(data.logs || []);
        setIsResultsModalOpen(true);
        fetchScrapers(); // Refresh to update last run time
      } else {
        toast.error(data.message || "Failed to run scraper");
        if (data.logs) {
          setCurrentLogs(data.logs);
          setIsLogModalOpen(true);
        }
      }
    } catch (error) {
      console.error("Error running scraper:", error);
      toast.error("Failed to run scraper");
    } finally {
      setIsRunning(false);
    }
  };

  const deleteScraper = async (scraperId) => {
    if (window.confirm("Are you sure you want to delete this scraper?")) {
      try {
        const response = await fetch(`/api/scrapers/${scraperId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          toast.success("Scraper deleted successfully");
          fetchScrapers();
        } else {
          toast.error("Failed to delete scraper");
        }
      } catch (error) {
        console.error("Error deleting scraper:", error);
        toast.error("Failed to delete scraper");
      }
    }
  };

  const viewResults = async (scraperId) => {
    try {
      const response = await fetch(`/api/scrapers/${scraperId}/results`);
      const data = await response.json();

      if (data.success) {
        setCurrentResults(data.results);
        setCurrentLogs(data.logs || []);
        setIsResultsModalOpen(true);
      } else {
        toast.error("Failed to fetch results");
      }
    } catch (error) {
      console.error("Error fetching results:", error);
      toast.error("Failed to fetch results");
    }
  };

  const viewLogs = async (scraperId) => {
    try {
      const response = await fetch(`/api/scrapers/${scraperId}/logs`);
      const data = await response.json();

      if (data.success) {
        setCurrentLogs(data.logs);
        setIsLogModalOpen(true);
      } else {
        toast.error("Failed to fetch logs");
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast.error("Failed to fetch logs");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Automation</h1>
        <button
          onClick={() => openConfigModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Create Scraper
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Web Scrapers</h2>

        {scrapers.length === 0 ? (
          <div className="text-center py-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No scrapers
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new web scraper.
            </p>
            <div className="mt-6">
              <button
                onClick={() => openConfigModal()}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="-ml-1 mr-2 h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                New Scraper
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Run
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {scrapers.map((scraper) => (
                  <tr key={scraper._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {scraper.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 truncate max-w-xs">
                        <a
                          href={scraper.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {scraper.url}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {scraper.schedule || "Manual only"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          scraper.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {scraper.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {scraper.lastRun
                        ? new Date(scraper.lastRun).toLocaleString()
                        : "Never"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => runScraper(scraper._id)}
                        disabled={isRunning}
                        className="text-indigo-600 hover:text-indigo-900 mr-3 disabled:opacity-50"
                      >
                        {isRunning ? "Running..." : "Run"}
                      </button>
                      <button
                        onClick={() => viewResults(scraper._id)}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        Results
                      </button>
                      <button
                        onClick={() => viewLogs(scraper._id)}
                        className="text-yellow-600 hover:text-yellow-900 mr-3"
                      >
                        Logs
                      </button>
                      <button
                        onClick={() => openConfigModal(scraper)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteScraper(scraper._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Scraper Configuration Modal */}
      <ScraperConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onSave={saveScraper}
        scraperConfig={scraperConfig}
        setScraperConfig={setScraperConfig}
        isSaving={isSaving}
      />

      {/* Results Modal */}
      <ResultsModal
        isOpen={isResultsModalOpen}
        onClose={() => setIsResultsModalOpen(false)}
        results={currentResults}
        scraperName={editingScraper?.name || "Scraper"}
      />

      {/* Execution Log Modal */}
      <ExecutionLogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        logs={currentLogs}
      />
    </div>
  );
}
