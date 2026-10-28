# tinyopsec/MiniCPM5-1B-Agentic-Tooluse-v3-Merged-FP16-GGUF

## Resumen

MiniCPM5-1B-Agentic-Tooluse-v3-Merged-FP16-GGUF es un repositorio de cuantizaciones GGUF generado por el usuario `tinyopsec` a partir del checkpoint fusionado `ewin-reg/MiniCPM5-1B-Agentic-Tooluse-v3-Merged-FP16`, que a su vez deriva del modelo base `openbmb/MiniCPM5-1B`. No se trata, por tanto, de un modelo entrenado desde cero, sino de una redistribución en formato llama.cpp de un ajuste fino orientado a *tool calling* y flujos agénticos, fusionado con su modelo base y convertido a coma flotante de 16 bits antes de cuantizar.

El interés práctico del artefacto está en su tamaño: 1.080.632.832 parámetros (aproximadamente 1,08 mil millones), lo que lo sitúa en la franja de modelos desplegables en CPU, portátiles sin GPU dedicada y dispositivos de borde. El repositorio ofrece trece variantes de cuantización, desde F16 hasta Q2_K, lo que permite ajustar el equilibrio entre calidad y huella de memoria sin salir del ecosistema GGUF (llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python).

La relevancia es acotada pero real: los modelos de ~1B con capacidad declarada de invocación de herramientas son útiles como enrutadores, extractores estructurados o agentes de bajo coste en pipelines donde el coste por token y la latencia importan más que la precisión bruta. Ahora bien, el repositorio no documenta longitud de contexto, idiomas, datos de entrenamiento ni evaluación alguna, y cuenta con cero descargas y cero *likes* en el momento de la consulta, por lo que debe tratarse como un artefacto sin validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la model card; heredada del modelo base `openbmb/MiniCPM5-1B` |
| Parámetros totales | 1.080.632.832 (dato real, safetensors del modelo base) |
| Parámetros activos | No aplica (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M (recomendada por el autor), Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (F16 y cuantizaciones K-quant / legacy) |
| Tamaño del repositorio | 10,8 GB (conjunto de todos los ficheros) |
| Tamaño del fichero F16 | 2,0 GB (según la model card) |
| Librería declarada | `gguf` (llama.cpp) |
| Pipeline | `text-generation` |
| Modelo base | `openbmb/MiniCPM5-1B` |
| Checkpoint de origen | `ewin-reg/MiniCPM5-1B-Agentic-Tooluse-v3-Merged-FP16` |
| Etiquetas | `tool-calling`, `agentic`, `v3`, `llama-cpp`, `endpoints_compatible`, `conversational` |
| Fecha de creación del repo | 2026-10-28 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo. Lo único confirmado es que se trata de un derivado de `openbmb/MiniCPM5-1B` con 1.080.632.832 parámetros, ajustado para *tool calling* (checkpoint «Agentic-Tooluse-v3»), posteriormente fusionado (*merged*) con su base y exportado a FP16 antes de la cuantización. El método exacto de fusión (por ejemplo, ponderaciones tipo TIES, DARE o SLERP), la proporción de mezcla y el conjunto de datos del ajuste fino no se documentan en la model card.

Tampoco se especifican el número de tokens de entrenamiento, la composición del corpus, la existencia de fases de RLHF/DPO, la plantilla de chat empleada ni el esquema de herramientas esperado en la entrada. Dado que el modelo se distribuye únicamente en GGUF, el proceso de conversión se realizó con las herramientas de llama.cpp (`convert_hf_to_gguf.py` y `llama-quantize`), pero el repositorio no incluye el `tokenizer_config.json` ni la plantilla Jinja de chat, algo relevante para reproducir el formato de invocación de herramientas.

Como innovación técnica, lo único destacable es la propia cadena de derivación: un *merge* de un ajuste fino agéntico con su base, pensado probablemente para recuperar capacidad general sacrificada durante el ajuste, seguido de una batería completa de cuantizaciones K-quant que cubre desde 16 hasta ~2 bits por peso.

## Capacidades

- Generación de texto conversacional multi-turno (etiqueta `conversational` y pipeline `text-generation`).
- Invocación de herramientas / *function calling*, según la etiqueta `tool-calling` del autor; no se documenta el esquema exacto (formato JSON, delimitadores ni plantilla).
- Flujos agénticos de varios pasos, según la etiqueta `agentic` del autor; sin ejemplos ni trazas publicadas.
- Salida estructurada plausible para extracción de campos y enrutamiento, al estar el ajuste orientado a herramientas; no verificado en la información disponible.
- Compatibilidad con *endpoints* de Hugging Face (etiqueta `endpoints_compatible`).
- Capacidades de razonamiento, matemáticas y código: no documentadas ni evaluadas en la información disponible.
- Visión, audio o modo *thinking* explícito: no disponibles; no hay indicios de soporte multimodal.

## Casos de uso

- **Enrutador de intenciones en asistentes**: con ~1B de parámetros, el modelo puede clasificar la consulta del usuario en una de N herramientas o *endpoints* antes de llamar a un modelo mayor, reduciendo coste y latencia en la primera etapa del pipeline.
- **Extracción de campos estructurados**: dado un texto libre (correo, ticket, fragmento de contrato), generar un JSON con campos predefinidos. El tamaño reducido permite ejecutarlo por documento sin coste apreciable de GPU.
- **Agente local en el dispositivo**: despliegue en portátil o mini-PC sin GPU mediante la cuantización Q4_K_M o Q2_K, con llama.cpp u Ollama, para tareas de automatización personal (calendario, ficheros, notas) sin enviar datos a la nube.
- **Automatización de tareas de soporte de primer nivel**: gestión de conversaciones multi-turno con llamadas a herramientas internas (consulta de pedidos, estado de incidencias). La ventana de contexto real debe validarse empíricamente, ya que no está documentada.
- **Generación de llamadas a API en CI/CD**: uso como paso de validación que comprueba si una función o *endpoint* propuesto por otro modelo tiene el esquema correcto, actuando como filtro barato antes de los tests.
- **Prototipado rápido y pruebas de concepto**: al ser Apache 2.0 y estar disponible en trece cuantizaciones, sirve para validar una arquitectura agéntica completa en local antes de invertir en un modelo mayor o en infraestructura GPU.
- **Generación aumentada con recuperación en equipos modestos**: el modelo puede reformular consultas o resumir fragmentos recuperados en un RAG de bajo coste, siempre que la longitud de contexto se confirme adecuada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas de MMLU, HumanEval, GSM8K, BFCL (*Berkeley Function Calling Leaderboard*) ni de ningún otro conjunto de evaluación, ni comparaciones con el modelo base o con el checkpoint sin fusionar. Tampoco hay mediciones de latencia o *throughput*. Cualquier cifra de rendimiento empleada para decidir su adopción deberá obtenerse mediante evaluación propia, especialmente en lo relativo a la precisión de las llamadas a herramientas.

## Requisitos de hardware

- **VRAM/RAM estimada para los pesos** (cálculo a partir de 1,08B parámetros; los tamaños reales de los ficheros distintos de F16 no se publican):
  - F16: ~2,2 GB de pesos (el autor indica 2,0 GB de fichero).
  - Q8_0: ~1,15 GB.
  - Q6_K: ~0,9 GB.
  - Q5_K_M: ~0,8 GB.
  - Q4_K_M: ~0,65-0,7 GB.
  - Q3_K_M: ~0,55 GB.
  - Q2_K: ~0,35-0,4 GB.
  - Añadir a estas cifras el *prompt* procesado, la caché KV y el *overhead* del runtime (típicamente varios cientos de MB adicionales).
- **GPU recomendadas**: cualquier GPU con 4 GB o más de VRAM funciona con Q4_K_M o Q5_K_M (GTX 1650, RTX 3050/3060, RTX 4060, portátiles con gráfica integrada reciente). En tarjetas de datacenter (L4, A10, A100, H100) el modelo queda sobredimensionado en memoria pero permite *batching* elevado; el interés ahí es el coste por token, no la VRAM.
- **¿Cabe en GPU de consumo?** Sí, en todas las cuantizaciones, incluidas las de 16 bits en tarjetas con 8 GB. También es viable en CPU pura y en dispositivos ARM de 8 GB con Q4_K_M.
- **Opciones de despliegue**: llama.cpp (`llama-cli`, `llama-server`) con backend CUDA, Metal, Vulkan o SYCL; Ollama y LM Studio mediante importación del GGUF; koboldcpp; llama-cpp-python para integración en aplicaciones Python; Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`). vLLM solo con soporte GGUF experimental; TGI no carga GGUF de forma nativa: para ambos habría que partir de los safetensors del checkpoint original.
- **Latencia y throughput**: no disponible. No hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token en ningún hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| MiniCPM5-1B-Agentic-Tooluse-v3 (este) | 1,08B | No disponible | Apache 2.0 | GGUF (13 cuantizaciones) | Ajuste agéntico fusionado; sin benchmarks ni idiomas declarados |
| Llama-3.2-1B-Instruct | 1,24B | 128K | Llama 3.2 Community License | Safetensors, GGUF | Documentación completa y amplia adopción; licencia con restricciones de uso |
| Qwen2.5-1.5B-Instruct | 1,54B | 32K nativo (extensible por YaRN) | Apache 2.0 | Safetensors, GGUF, AWQ, GPTQ | Buena cobertura multilingüe y de código; series Qwen3 posteriores con modo *thinking* |
| SmolLM2-1.7B-Instruct | 1,71B | 8K | Apache 2.0 | Safetensors, GGUF | Entrenamiento y evaluación documentados; sin enfoque específico en *tool calling* |

Los datos de los modelos alternativos provienen de sus respectivas documentaciones públicas. La comparación de rendimiento no puede establecerse con cifras porque este repositorio no publica ninguna evaluación; la ventaja diferencial del modelo es su orientación declarada a *tool calling* combinada con una licencia Apache 2.0 sin cláusulas adicionales, frente a la licencia de la familia Llama 3.2.

## Limitaciones y advertencias

- **Sin evaluación publicada**: no hay benchmarks, ni pruebas de precisión de *tool calling*, ni comparación con el checkpoint de origen. La etiqueta «agentic» es una declaración del autor, no un resultado medido.
- **Contexto desconocido**: al no documentarse la longitud de contexto ni la plantilla de chat, el comportamiento en conversaciones largas o con muchas herramientas puede degradarse de forma imprevisible.
- **Idiomas no declarados**: el campo de idiomas está vacío en los metadatos. El soporte de castellano es incierto y debe validarse antes de usarlo en producción; es esperable un rendimiento inferior al de modelos con cobertura multilingüe explícita.
- **Riesgo de alucinación en argumentos de herramientas**: los modelos de ~1B tienden a inventar nombres de funciones, parámetros o valores de tipo; es imprescindible validar el JSON de salida contra un esquema y aplicar reintentos o *fallbacks* deterministas.
- **Cuantizaciones agresivas**: Q3 y Q2_K degradan de forma notable la coherencia y la fidelidad del formato en modelos pequeños; para uso agéntico conviene no bajar de Q5_K_M o Q4_K_M.
- **Trazabilidad limitada**: el repositorio no incluye la model card del ajuste fino original, la composición del dataset, ni el método de fusión. No es posible auditar qué datos vieron el modelo ni si el *merge* introdujo regresiones.
- **Licencia**: Apache 2.0 permite uso comercial y modificaciones, pero conviene verificar que el modelo base `openbmb/MiniCPM5-1B` mantiene la misma licencia y que el ajuste intermedio (`ewin-reg/...`) no impone condiciones adicionales.
- **Madurez del artefacto**: cero descargas y cero *likes*, publicado por un autor individual sin historial verificable en los datos disponibles. No se ha validado la integridad de los ficheros GGUF publicados ni la coherencia entre cuantizaciones.
- **Sesgos**: no documentados. Al no conocerse la composición del corpus de ajuste, no puede evaluarse el sesgo demográfico, geográfico o lingüístico.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tinyopsec/MiniCPM5-1B-Agentic-Tooluse-v3-Merged-FP16-GGUF
- Checkpoint de origen (FP16 fusionado): https://huggingface.co/ewin-reg/MiniCPM5-1B-Agentic-Tooluse-v3-Merged-FP16
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-1B
- llama.cpp (runtime y herramientas de conversión/cuantización): https://github.com/ggml-org/llama.cpp
- Organización OpenBMB: https://huggingface.co/openbmb
