# Xemdark/dextools-dexscreener-trending-bot

## Resumen

El artefacto publicado bajo el identificador `Xemdark/dextools-dexscreener-trending-bot` no es un modelo de inteligencia artificial. Se trata de un paquete ejecutable para Windows x64 (etiquetado como portable y distribuido en un ZIP de 8,9 MB) que el autor presenta como un bot de seguimiento de tendencias para Dextools y Dexscreener. No existe ningún peso neuronal, tokenizador, configuración de arquitectura ni pipeline de inferencia asociado al repositorio.

La model card describe una aplicación de escritorio con licencia MIT, supuestamente compatible con Windows 10 y 11 de 64 bits, con instalación mediante contraseña de archivo y ejecución como administrador. Las especificaciones técnicas habituales de un modelo (arquitectura, parámetros, contexto, cuantización) no están disponibles porque el artefacto no las posee.

Es relevante advertir que el patrón de distribución descrito —binario ejecutable alojado en un repositorio de GitHub de terceros, archivo ZIP protegido con contraseña, instrucciones para desactivar avisos de SmartScreen y ejecución con privilegios elevados— coincide con tácticas habituales de campañas de malware. El repositorio de Hugging Face registra cero descargas y cero likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Windows x64) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` de Windows) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento que describir. El contenido del repositorio es un binario compilado para Windows x64, presentado en la model card como una herramienta de escritorio con supuestos módulos de seguimiento de tendencias, licenciamiento offline, copia de seguridad del binario original y configuración automática de reglas de cortafuegos.

La model card incluye afirmaciones técnicas no verificables (13 hilos de trabajo, sondeo a 235 Hz, consistencia del 97,6 %, uso de RAM inferior a 42 MB) que no vienen respaldadas por código fuente, pesos publicados ni documentación reproducible. No se declara ningún conjunto de datos, método de alineación (RLHF, DPO) ni innovación técnica verificable.

## Capacidades

- No se ha documentado ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión.
- No se ha documentado soporte de tool calling ni function calling.
- No se ha documentado soporte de agentes ni razonamiento multi-paso.
- No se ha documentado capacidad multilingüe real; los idiomas listados son metadatos del repositorio, no capacidades del artefacto.
- La model card atribuye al binario funciones de seguimiento de tendencias en Dextools y Dexscreener, licenciamiento offline y copia de seguridad; ninguna de ellas es verificable con la información disponible.

## Casos de uso

- No se identifican casos de uso legítimos como modelo de IA, dado que el artefacto no es un modelo.
- Evaluación de riesgos de cadena de suministro: el repositorio puede emplearse como caso de estudio de patrones de distribución sospechosos (ZIP con contraseña, enlaces a releases de GitHub ajenos al autor, instrucciones para desactivar SmartScreen).
- Análisis de metadatos en Hugging Face: útil para estudiar cómo se etiquetan artefactos no modelo dentro del Hub y cómo afecta eso a los filtros de búsqueda.
- Formación en seguridad: sirve como ejemplo didáctico de ingeniería social en torno a herramientas de trading de criptomonedas.
- Auditoría de licencias: permite comprobar la aplicación de la etiqueta MIT a un binario sin código fuente asociado.
- Monitorización de repositorios: puede integrarse en pipelines de detección de publicaciones con cero descargas y enlaces externos de descarga directa.
- No se recomienda su ejecución en entornos de producción, investigación ni desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artefacto no es un modelo de lenguaje y no admite evaluación con MMLU, HumanEval, GSM8K ni métricas equivalentes.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos que cargar en GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Requisitos declarados por el autor: Windows 10 u 11 de 64 bits, ejecución como administrador, extracción previa del ZIP con contraseña y menos de 42 MB de RAM según la model card (dato no verificado).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el artefacto no pertenece a la categoría de modelos de IA. A modo de contraste con herramientas legítimas de análisis de mercado, se indica lo siguiente:

| Artefacto | Naturaleza | Pesos publicados | Código fuente | Verificabilidad |
|---|---|---|---|---|
| Xemdark/dextools-dexscreener-trending-bot | Binario Windows x64 en ZIP | No | No | Nula |
| API pública de Dexscreener | Servicio HTTP documentado | No aplica | No aplica | Alta (documentación pública) |
| Bibliotecas cliente de exchanges (por ejemplo, CCXT) | Código fuente abierto | No aplica | Sí | Alta |

## Limitaciones y advertencias

- El artefacto no es un modelo de IA pese a estar alojado en Hugging Face; los filtros por pipeline, parámetros o formato de pesos no devuelven información.
- Distribución mediante ZIP protegido con contraseña y ejecutable alojado en un repositorio de GitHub de un tercero (`alessiokwon72`), no en el repositorio del autor declarado en Hugging Face.
- Instrucciones explícitas para ejecutar como administrador y para ignorar o desactivar avisos de Windows Defender y SmartScreen, lo que elimina las protecciones del sistema operativo.
- Afirmaciones de rendimiento no verificables y ausencia total de código fuente, pese a la etiqueta de licencia MIT.
- Cero descargas y cero likes en el momento de la consulta, sin historial de mantenimiento.
- Riesgo elevado de malware, robo de credenciales o de claves de carteras de criptomonedas, dado el contexto de trading con el que se presenta.
- No debe ejecutarse en máquinas personales ni corporativas; si se manipula, hacerlo en una máquina virtual aislada y sin acceso a red.
- La licencia MIT declarada no aporta garantías sobre el contenido del binario ni sobre su procedencia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Xemdark/dextools-dexscreener-trending-bot
- Repositorio de GitHub referenciado en la model card (no verificado, no recomendado): https://github.com/alessiokwon72/dextools-dexscreener-trending-bot
- Releases referenciadas en la model card (no verificadas, no recomendadas): https://github.com/alessiokwon72/dextools-dexscreener-trending-bot/releases/latest
- Documentación de Hugging Face sobre seguridad en el Hub: https://huggingface.co/docs/hub/security
- Documentación de Microsoft sobre SmartScreen: https://support.microsoft.com/windows/smartScreen
