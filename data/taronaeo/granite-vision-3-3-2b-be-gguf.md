# taronaeo/Granite-Vision-3.3-2B-BE-GGUF

## Resumen

Granite-Vision-3.3-2B-BE-GGUF es una cuantización en formato GGUF del modelo vision-language `ibm-granite/granite-vision-3.3-2b` de IBM Granite, adaptada específicamente para su ejecución en sistemas IBM Z y LinuxONE (arquitecturas s390x de IBM, como z15, z16 y z17). El sufijo "BE" hace referencia a que los pesos han sido convertidos a big-endian (byte-swapped), un requisito imprescindible para que llama.cpp pueda operar sobre estas plataformas mainframe, que emplean ordenamiento de bytes big-endian frente al little-endian habitual en x86-64 y ARM.

El modelo original es un VLM compacto (2.533.533.696 parámetros) diseñado para comprensión de documentos visuales: extracción automática de contenido de tablas, gráficos, infografías, diagramas y figuras. Incorpora capacidades experimentales como segmentación de imágenes, generación de DocTags y soporte multipágina, y fue entrenado mediante fine-tuning de un LLM Granite con modalidades de imagen y texto sobre datos de instrucciones curados (públicos y sintéticos).

La relevancia de esta ficha radica en que es una de las pocas distribuciones públicas de un modelo multimodal listo para mainframe IBM Z, lo que permite desplegar cargas de trabajo de IA generativa y visión por computador directamente en infraestructura empresarial crítica sin necesidad de trasladar los datos a plataformas x86 o GPU convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (LLM Granite con adaptador de visión; detalles internos no disponibles) |
| Parametros totales | 2.533.533.696 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_0, Q5_1, Q5_K_S, Q5_K_M, Q6_K, Q8_0, BF16, F16, F32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (big-endian, byte-swapped para s390x) |

## Arquitectura y entrenamiento

El modelo subyacente, `granite-vision-3.3-2b`, es un modelo vision-language construido mediante fine-tuning de un LLM Granite al que se le incorpora la modalidad visual. Está orientado específicamente a la comprensión de documentos visuales y fue entrenado sobre un corpus de datos de instrucciones cuidadosamente curado, que combina conjuntos de datos públicos y sintéticos diseñados para cubrir tareas de comprensión documental y de imagen general. La model card no detalla el número exacto de tokens de entrenamiento, la composición porcentual del dataset ni si se aplicaron fases de RLHF o DPO.

La innovación técnica más destacable de esta distribución concreta no reside en el modelo en sí, sino en el proceso de conversión a big-endian para su ejecución en IBM Z y LinuxONE mediante llama.cpp. El autor mantiene una guía específica de compilación para s390x. Además, el modelo original introduce capacidades experimentales como segmentación de imágenes, generación de DocTags (representación estructurada de documentos) y soporte multipágina, junto con mejoras de seguridad respecto a versiones anteriores de la familia Granite Vision.

## Capacidades

- Generación de texto a partir de imágenes (image-to-text) y razonamiento sobre contenido visual.
- Comprensión de documentos visuales: tablas, gráficos, infografías, diagramas y figuras.
- Extracción automática de contenido estructurado de documentos.
- Generación de DocTags para representación estructurada de documentos (capacidad experimental).
- Segmentación de imágenes (capacidad experimental).
- Soporte de documentos multipágina (capacidad experimental).
- Conversación multi-turno (tag `conversational`).
- Compatibilidad con endpoints (`endpoints_compatible`).
- Capacidades de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras modalidades: no disponible en la información proporcionada.

## Casos de uso

- Digitalización de facturas y albaranes en mainframe: el modelo puede procesar imágenes de documentos contables y extraer campos estructurados (importes, fechas, conceptos) directamente en un sistema IBM Z, evitando el envío de datos financieros sensibles a infraestructura externa.
- Extracción de tablas de informes regulatorios: gracias a su especialización en comprensión de tablas y gráficos, permite convertir informes en PDF o imágenes a datos tabulares reutilizables en pipelines de cumplimiento normativo que ya residen en LinuxONE.
- Procesamiento de documentación técnica y diagramas de arquitectura: útil para equipos que mantienen documentación legacy en mainframe y necesitan indexar o resumir diagramas y esquemas almacenados como imágenes.
- Análisis de infografías y dashboards corporativos: el modelo puede describir y extraer conclusiones de paneles visuales generados por herramientas de BI, integrándose en flujos de reporting automatizado.
- Asistente documental en entorno bancario regulado: al ejecutarse sobre s390x con licencia Apache 2.0, permite desplegar un asistente de consulta de documentos internos sin salir del perímetro del mainframe, cumpliendo requisitos de soberanía del dato.
- Prototipado y pruebas de concepto de IA multimodal en IBM Z: con cuantizaciones desde Q2_K (932,9 MB) hasta F32 (9,4 GB), es viable experimentar en particiones LinuxONE con recursos limitados antes de escalar a modelos mayores.
- Enriquecimiento de archivos históricos escaneados: segmentación de imágenes y DocTags permiten trocear documentos complejos (formularios, actas) en regiones semánticas para su posterior indexación o archival estructurado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card original menciona que se realizaron evaluaciones con el framework `llms-eval` comparando con versiones previas de Granite Vision, pero los valores numéricos no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~0,9 GB; Q3_K_S ~1,1 GB; Q4_K_M ~1,4 GB; Q5_K_M ~1,7 GB; Q6_K ~1,9 GB; Q8_0 ~2,5 GB; BF16/F16 ~4,7 GB; F32 ~9,4 GB (los pesos del modelo; el consumo real incluye overhead del runtime y del codificador visual).
- GPU recomendadas: no disponible para el caso de uso principal, ya que esta distribución está pensada para CPU s390x (IBM z15, z16, z17 y LinuxONE). Para la variante estándar del modelo base, cualquier GPU con al menos 6-8 GB de VRAM podría ejecutar cuantizaciones Q4/Q5.
- Compatibilidad con GPU de consumo: sí para la variante estándar del modelo base; esta variante big-endian está orientada a mainframe, no a GPU consumer.
- Opciones de despliegue: llama.cpp (compilación específica para s390x, ver guía del autor); `llama-server` con descarga directa desde Hugging Face (`build/bin/llama-server -hf taronaeo/Granite-Vision-3.3-2B-BE-GGUF:Q4_K_M`). vLLM, TGI u Ollama no están documentados para esta variante big-endian.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / plataforma | Notas |
|---|---|---|---|---|---|
| taronaeo/Granite-Vision-3.3-2B-BE-GGUF | 2.533.533.696 | no disponible | Apache 2.0 | GGUF big-endian (s390x) | Cuantización para IBM Z / LinuxONE |
| ibm-granite/granite-vision-3.3-2b | 2.533.533.696 | no disponible | Apache 2.0 | safetensors (modelo original) | Modelo base oficial de IBM |
| ibm-granite/granite-4.0-3b-vision | no disponible | no disponible | no disponible | no disponible | Sucesor indicado por el autor (`new_version`) |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Esta distribución está byte-swapped para big-endian: no funcionará correctamente en plataformas little-endian (x86-64, ARM) sin la conversión inversa. Para uso general debe emplearse el modelo base oficial.
- Las cuantizaciones Q2_K y Q3_K introducen pérdida de calidad significativa según la propia model card; para producción se recomienda Q4_K_M o superior.
- Riesgo de alucinación inherente a los modelos vision-language, especialmente en la extracción de cifras de tablas y gráficos; se recomienda validación posterior en flujos críticos.
- Sesgos conocidos: no disponible en la información proporcionada.
- Limitaciones de contexto e idioma: no disponible en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución con atribución; no obstante, conviene revisar las condiciones del modelo base de IBM para confirmar obligaciones adicionales de atribución.
- El modelo base incluye capacidades marcadas como experimentales (segmentación, DocTags, multipágina); su fiabilidad en producción no está garantizada.
- Solo 1105 descargas y 0 likes en el momento de la consulta: comunidad reducida, lo que implica menor validación externa y soporte limitado.
- El autor señala `granite-4.0-3b-vision` como nueva versión; esta distribución puede quedar obsoleta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/taronaeo/Granite-Vision-3.3-2B-BE-GGUF
- Modelo base oficial: https://huggingface.co/ibm-granite/granite-vision-3.3-2b
- Organización IBM Granite: https://huggingface.co/ibm-granite
- Guía de compilación de llama.cpp para s390x: https://github.com/ggml-org/llama.cpp/blob/master/docs/build-s390x.md
- Paper de referencia (arxiv:2502.09927): https://arxiv.org/abs/2502.09927
- Nueva versión indicada por el autor: https://huggingface.co/ibm-granite/granite-4.0-3b-vision
- Ficha de terceros (free2aitools): https://free2aitools.com/model/taronaeo/granite-vision-3.3-2b-be-gguf
