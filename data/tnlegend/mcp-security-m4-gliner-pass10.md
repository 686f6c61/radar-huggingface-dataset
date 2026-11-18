# tnlegend/mcp-security-m4-gliner-pass10

## Resumen

`tnlegend/mcp-security-m4-gliner-pass10` es un ajuste fino de investigación sobre el modelo base `fastino/gliner2.5-base-v1`, un extractor de entidades de propósito general de la familia GLiNER2. Lo publica el usuario `tnlegend` como parte de un framework de seguridad para el protocolo MCP (Model Context Protocol), con el objetivo de realizar extracción semántica estructurada de descripciones de herramientas MCP en inglés. El modelo no es un clasificador de prompt injection autónomo ni un mecanismo de autorización: según su propia model card, actúa como componente de extracción de solo lectura dentro de un pipeline mayor que decide qué herramientas expone un servidor MCP.

Con 193,5 millones de parámetros y un repositorio de 0,8 GB en formato safetensors, es un modelo compacto de token-classification derivado del encoder DeBERTa-v3-base de Microsoft (licencia MIT). La licencia del ajuste es Apache 2.0, lo que permite uso comercial, aunque el autor restringe explícitamente la autoridad de producción al framework firmado que lo acompaña.

Su relevancia es acotada pero concreta: cubre un nicho emergente (seguridad en servidores MCP) con un modelo pequeño, desplegable en hardware modesto, y con artefacto verificado por hash SHA-256. No obstante, tiene cero descargas y cero likes en el momento de la consulta, y no publica benchmarks ni datos de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3-base, derivado de Microsoft, licencia MIT); ajuste GLiNER2 para token-classification / extracción de entidades |
| Parámetros totales | 193.581.591 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 (encoder base DeBERTa-v3-base bajo MIT) |
| Formato de pesos | safetensors (`model.safetensors`, SHA-256 `6621bd9f90b9439d4b0883333c05a002bdae77b75b3e78d15f085830dd777130`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `fastino/gliner2.5-base-v1`, que a su vez se apoya en el encoder DeBERTa-v3-base de Microsoft. GLiNER2 es una familia de extractores de entidades de propósito general que permiten definir los tipos de entidad en tiempo de inferencia mediante prompts estructurados, en lugar de fijar un conjunto cerrado de etiquetas en el entrenamiento. El pipeline declarado es `token-classification` y la librería asociada es `gliner2`.

El ajuste se denomina "PASS10" y está orientado a la extracción semántica estructurada de descripciones de herramientas MCP en inglés, dentro de un framework de seguridad de investigación. La model card no especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o similares. Tampoco se documentan innovaciones de decodificación (especulativa, atención lineal) ni detalles sobre el proceso de ajuste más allá del nombre del checkpoint. El autor indica explícitamente que los datos de entrenamiento, las descripciones MCP en bruto, las evaluaciones privadas y las firmas no se incluyen en el repositorio.

## Capacidades

- Extracción de entidades y estructuras semánticas a partir de texto en inglés, mediante definición de tipos de entidad en tiempo de inferencia (patrón GLiNER).
- Token-classification orientada a descripciones de herramientas y capacidades MCP (protocolo de contexto de modelos).
- Extracción estructurada de solo lectura ("advisory"): produce información para que un componente externo decida, no bloquea ni autoriza llamadas por sí mismo.
- Soporte de idioma limitado al inglés; no se declaran capacidades multilingües.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo "thinking".
- No es un generador de texto libre: su salida es etiquetado de tokens, no texto generativo.

## Casos de uso

- Auditoría de servidores MCP: el modelo extrae las entidades y capacidades declaradas en las descripciones de herramientas de un servidor MCP, y un analizador firmado externo evalúa si esas capacidades son coherentes con las políticas de seguridad. El modelo aporta la capa de extracción; la decisión queda fuera de él.
- Catalogación de herramientas en entornos de agentes: dado un conjunto de descripciones MCP en inglés, el modelo estructura qué acciones expone cada herramienta (lectura de ficheros, acceso a red, ejecución de comandos) para alimentar un inventario de superficie de ataque.
- Investigación en seguridad de protocolos de agentes: sirve como componente reproducible (artefacto verificado por hash) en experimentos sobre prompt injection y abuso de herramientas MCP, siempre dentro del framework M4.
- Enriquecimiento de pipelines de revisión de código y configuración: al procesar ficheros de configuración de servidores MCP, el modelo extrae las capacidades declaradas para que un revisor humano o un sistema de políticas las contraste con las realmente implementadas.
- Filtrado previo en plataformas de terceros: un marketplace de servidores MCP puede usar la extracción estructurada para clasificar herramientas por categoría de riesgo antes de una revisión manual, reduciendo el volumen de revisión.
- Despliegue en hardware modesto para pruebas internas: con 193,5 M de parámetros, cabe en GPUs de consumo para prototipos de extracción, lo que facilita iterar sobre políticas de seguridad sin infraestructura dedicada.
- Componente de un sistema de observabilidad: registrar y estructurar las descripciones de herramientas que un agente descubre en tiempo de ejecución, para detectar cambios sospechosos entre versiones de un servidor MCP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, recall, F1 ni comparaciones con el modelo base o con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,8 GB solo para pesos, más overhead de activaciones y tokenizador; en la práctica, menos de 2 GB para lotes pequeños.
- VRAM estimada en fp16/bf16: en torno a 0,4 GB para pesos; cabe holgadamente en cualquier GPU de consumo moderna.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, RTX 4060, RTX 4090, A100, H100). Para este tamaño, la GPU no es el cuello de botella.
- Cabe en GPU de consumo: sí, en todas las RTX y en muchas iGPU con suficiente memoria compartida; también es viable en CPU para cargas por lotes no interactivas.
- Opciones de despliegue: la librería `gliner2` es la vía natural; al ser un transformer estándar en safetensors, también puede servirse con frameworks de inferencia compatibles con Hugging Face Transformers. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al no haber variantes GGUF, llama.cpp y Ollama no son opciones directas sin conversión.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tnlegend/mcp-security-m4-gliner-pass10` | 193,5 M | No disponible | Token-classification / extracción MCP | Apache 2.0 | Hugging Face, 0 descargas |
| `fastino/gliner2.5-base-v1` (modelo base) | No disponible en la información proporcionada | No disponible | Extracción de entidades general | No disponible en la información proporcionada | Hugging Face |
| `microsoft/deberta-v3-base` (encoder subyacente) | ~184 M (aproximado, no confirmado en la información) | 512 tokens (estándar DeBERTa-v3, no confirmado en la información) | Encoder NLU general | MIT | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo es solo inglés; no procesa descripciones MCP en otros idiomas.
- No es un gate de prompt injection ni un mecanismo de autorización: la model card lo declara explícitamente como extractor de solo lectura. Usarlo como única defensa sería un error de diseño.
- Los datos de entrenamiento no se publican, por lo que no es posible evaluar sesgos, cobertura ni riesgo de sobreajuste a un corpus concreto de descripciones MCP.
- Riesgo de alucinación estructural: como extractor, puede producir entidades o etiquetas no presentes en el texto de entrada; no se documentan métricas de fiabilidad.
- La disponibilidad pública del modelo no otorga autoridad de análisis en producción según el autor: el framework exige un cierre firmado de analizador y fuente, con revisión inmutable fijada.
- El ajuste PASS10 es un derivado de investigación, no un checkpoint oficial de Fastino; no hay garantía de mantenimiento ni de soporte.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria ni informes independientes de uso.
- Aunque la licencia Apache 2.0 permite uso comercial, el encoder base DeBERTa-v3-base está bajo MIT y el autor incluye ficheros de licencia de terceros; conviene revisar `THIRD_PARTY_LICENSE_MIT.txt` y `NOTICE` antes de redistribuir.
- No hay variantes cuantizadas publicadas, lo que limita el despliegue en entornos que dependen de GGUF u otros formatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tnlegend/mcp-security-m4-gliner-pass10
- Modelo base: https://huggingface.co/fastino/gliner2.5-base-v1
- Repositorio GLiNER2: https://github.com/fastino-ai/GLiNER2
- Licencia del modelo: https://huggingface.co/tnlegend/mcp-security-m4-gliner-pass10/blob/main/LICENSE
- Licencia de terceros (MIT): https://huggingface.co/tnlegend/mcp-security-m4-gliner-pass10/blob/main/THIRD_PARTY_LICENSE_MIT.txt
- Aviso legal: https://huggingface.co/tnlegend/mcp-security-m4-gliner-pass10/blob/main/NOTICE
