# trithikkrishna/optivision-rag

## Resumen

OptiVision RAG es un proyecto académico de compresión extrema de índices vectoriales para recuperación de documentos con modelos visión-lenguaje (VLM) del estilo ColPali. Desarrollado por T. Rithik Krishna, Amgovath Navanitha y Badavath Akhila, estudiantes de B.Tech CSE (Data Science) del Departamento de Tecnologías Emergentes, bajo la guía de Ms. E. Sathiya Lakshmi, aborda el problema del enorme coste de almacenamiento de los índices generados por estos modelos: una sola página escaneada produce ~1000 vectores de 128 dimensiones en float32, lo que supone 512 KB por página y 512 GB para un corpus de un millón de páginas. El proyecto propone un pipeline de tres etapas (poda espacial, poda por redundancia y cuantización binaria) que reduce el índice hasta 113.5 veces sin modificar el modelo subyacente ni el proceso de consulta, manteniendo el 86.7% de la calidad de recuperación original (nDCG@5). La relevancia actual radica en que los sistemas de recuperación visual de documentos (sin OCR) son cada vez más usados en archivos históricos, oficinas de registro y bibliotecas digitales, donde el coste de almacenamiento es un factor limitante para su despliegue práctico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de compresión sobre modelos ColPali (VLM encoder + poda espacial + poda por redundancia + cuantización) |
| Parametros totales | No disponible (el modelo base usado en las pruebas es ColSmol-256M, pero el pipeline no introduce parámetros adicionales) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (no aplica, trabaja sobre imágenes de página) |
| Tipos de cuantizacion | float32 (baseline), int8, binario (±1) |
| Idiomas soportados | No disponibles (depende del modelo VLM subyacente) |
| Licencia | MIT |
| Formato de pesos | No aplica (no se publican pesos de un modelo, sino código y documentación del pipeline) |

## Arquitectura y entrenamiento

OptiVision RAG no es un modelo entrenado, sino un método de compresión de índices que actúa sobre las salidas de un modelo VLM existente (en las pruebas se usa ColSmol-256M). El pipeline consta de tres etapas:

1. **Poda espacial**: mide la densidad de tinta y la energía de borde de cada parche de la imagen y descarta aquellos sin contenido relevante, estimando el fondo del papel por percentil 95 por página (no asume blanco).
2. **Poda por redundancia**: agrupa parches casi duplicados (por ejemplo, el interior de celdas de tablas o líneas gruesas) y los colapsa a su centroide renormalizado, ya que MaxSim ya toma el máximo sobre vectores casi idénticos.
3. **Cuantización binaria**: convierte los vectores L2-normalizados y centrados en signos (±1), conservando el ortante y descartando la posición dentro del ortante. Las consultas se mantienen en float32 y se puntúan contra códigos binarios (score asimétrico), ya que hay millones de vectores de documento pero solo unas decenas de vectores de consulta.

No hay entrenamiento ni ajuste de pesos; el método se aplica en inferencia. Los datos de entrenamiento del modelo base no se especifican en la información disponible. La innovación clave es que la distorsión introducida por la cuantización es casi uniforme entre documentos, por lo que afecta más a las puntuaciones absolutas que al ranking relativo, como demuestra el Kendall tau.

## Capacidades

- Compresión de índices vectoriales para recuperación de documentos escaneados (sin OCR).
- Reducción del tamaño del índice entre 14.2x (con int8) y 113.5x (con binario) respecto al baseline float32.
- Preservación del ranking: Kendall tau de 0.866 frente al ranking original con la configuración prune+int8.
- Compatibilidad con el pipeline de recuperación late-interaction MaxSim (tanto en Qdrant como en un índice numpy exacto).
- Procesamiento ligero en CPU: la estimación de densidad de tinta y energía de borde se realiza en microsegundos por página, antes del paso por el VLM.
- No requiere modificaciones del modelo subyacente ni de la ruta de consulta.
- Soporta dos modos de operación: "índice mínimo" (prune+binario) y "mejor calidad por byte" (prune+int8).

## Casos de uso

- **Archivos históricos y registros públicos**: digitalizar millones de páginas escaneadas (actas, escrituras, expedientes) con un índice que pasa de ~448 GB a ~4 GB, permitiendo su despliegue en servidores modestos o incluso en máquinas con RAM limitada.
- **Bibliotecas digitales**: indexar libros antiguos, manuscritos y documentos con sellos o caligrafía que los sistemas OCR no pueden procesar, manteniendo una recuperación por similitud visual de alta calidad.
- **Gestión documental empresarial**: almacenar y buscar facturas, contratos y formularios escaneados en entornos con restricciones de almacenamiento, usando la configuración prune+int8 que conserva el 97.1% de la calidad de recuperación.
- **Investigación académica en recuperación visual**: servir como punto de partida para estudiar el equilibrio entre compresión y fidelidad en sistemas RAG visuales, ya que el código y los resultados están documentados.
- **Prototipos de demostración**: la aplicación Gradio incluida permite visualizar el proceso de compresión en un documento subido, útil para presentaciones o pruebas de concepto.
- **Despliegue en edge computing**: al reducir el índice a ~4 KB por página, es viable ejecutar búsquedas sobre corpus medianos en dispositivos con poca RAM, como portátiles o mini-PCs, sin necesidad de GPUs.

## Benchmarks y rendimiento

Los resultados medidos en 60 páginas y 72 consultas con ColSmol-256M en CPU son los siguientes:

| Variante | Tok/pg | KB/pg | Compresión | nDCG@5 | Retención | Kendall tau |
|---|---|---|---|---|---|---|
| baseline-float32 | 875.0 | 448.00 | 1.0x | 0.7823 | 100.0% | 1.000 |
| spatial-only | 356.1 | 182.32 | 2.5x | 0.7602 | 97.2% | 0.935 |
| spatial+redundancy | 246.8 | 126.34 | 3.5x | 0.7519 | 96.1% | 0.866 |
| int8-only | 875.0 | 112.00 | 4.0x | 0.7787 | 99.5% | 0.973 |
| prune+int8 | 246.8 | 31.59 | 14.2x | 0.7596 | 97.1% | 0.866 |
| binary-only | 875.0 | 14.00 | 32.0x | 0.6875 | 87.9% | 0.585 |
| optivision (prune+binario) | 246.8 | 3.95 | 113.5x | 0.6782 | 86.7% | 0.606 |
| optivision-aggressive | 186.3 | 2.98 | 150.3x | 0.6680 | 85.4% | 0.602 |

La poda espacial y por redundancia aportan una compresión de 3.5x con solo un 3.9% de pérdida de nDCG@5, mientras que la cuantización binaria introduce la mayor pérdida de calidad (12.1% sin reducir tokens). La configuración prune+int8 ofrece el mejor equilibrio calidad/byte, con un 97.1% de retención y un Kendall tau de 0.866.

## Requisitos de hardware

- **VRAM**: no requiere VRAM para el pipeline de compresión en sí, ya que opera sobre los vectores ya extraídos. El modelo VLM subyacente (ColSmol-256M) puede ejecutarse en CPU, como se indica en las pruebas.
- **GPU recomendada**: ninguna específica; el pipeline está diseñado para funcionar en CPU. Si se usa un VLM más grande, se requeriría la GPU correspondiente a ese modelo.
- **Compatibilidad con consumer GPU**: sí, cualquier máquina con CPU moderna es suficiente para la compresión; la indexación y búsqueda se pueden hacer con numpy o Qdrant en CPU.
- **Opciones de despliegue**: el repositorio incluye una demo Gradio; la integración con Qdrant permite búsqueda MaxSim a escala. No se mencionan vLLM, llama.cpp ni Ollama, ya que no es un modelo de generación de texto.
- **Latencia y throughput**: no se proporcionan datos de latencia, pero la poda espacial se describe como "microsegundos por página" antes del VLM. La búsqueda MaxSim sobre códigos binarios es considerablemente más rápida que sobre float32 por la reducción de tamaño.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otros proyectos o modelos que compitan directamente con OptiVision RAG en el ámbito de compresión de índices para recuperación visual de documentos. Los resultados de búsqueda web solo arrojan recursos genéricos sobre RAG y visión, sin proyectos comparables específicos.

## Limitaciones y advertencias

- La compresión binaria reduce la calidad de recuperación en ~12% (nDCG@5) respecto al baseline, y el Kendall tau cae a 0.606, lo que indica una distorsión notable en el ranking cuando se usa la configuración más agresiva.
- El proyecto se encuentra en una fase inicial (Stage-I) y es un trabajo académico; no está pensado como un servicio de producción RAG completo.
- La calidad final depende del modelo VLM subyacente; los resultados se han medido solo con ColSmol-256M y en un corpus pequeño (60 páginas), por lo que la generalización a otros modelos o dominios no está validada.
- No se especifican los idiomas soportados ni los sesgos potenciales, ya que dependen del modelo base.
- La licencia MIT permite uso comercial, pero el código no incluye garantías explícitas de rendimiento ni soporte.
- No se ha publicado documentación sobre el manejo de documentos con diseños muy complejos (tablas anidadas, gráficos, etc.) más allá de los casos mencionados.
- El repositorio de HuggingFace no contiene pesos de un modelo, sino código y documentación; los usuarios deben implementar el pipeline sobre su propio modelo VLM.

## Enlaces

- HuggingFace: https://huggingface.co/trithikkrishna/optivision-rag
- (No se proporcionan otros enlaces en la información disponible; la model card menciona docs/DEPLOY.md y docs/RESULTS.md dentro del repositorio, pero no se dan URLs externas.)
