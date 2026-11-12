# t-firefly/minicpm5-2b-rknn3-rk1820

## Resumen
MiniCPM5-2B-rknn3-rk1820 es una conversión del modelo MiniCPM5-2B de OpenBMB, adaptada por el equipo Firefly AI para su despliegue en el SoC Rockchip RK1820 mediante el runtime LlamaPi. No es un modelo nuevo: es un artefacto de despliegue edge que empaqueta los pesos del MiniCPM5-2B original en el formato RKNN3 requerido por la NPU del RK1820, con el objetivo de ejecutar inferencia de texto en dispositivos embebidos sin GPU dedicada.

El modelo base es un transformer denso de tipo LlamaForCausalLM con 2.500 millones de parámetros, 42 capas y una ventana de contexto nativa de 131.072 tokens. Según la model card, alcanza estado del arte en la categoría de 2B y compite con modelos de 4B en tareas de código, matemáticas, comprensión de contexto largo, uso de herramientas y flujos agénticos.

La relevancia de esta ficha radica en su nicho: llevar un modelo de 2B con contexto largo a hardware Rockchip RK1820 para asistentes locales y agentes de tool-use en el borde. La licencia Apache 2.0 del artefacto facilita su integración comercial, aunque la información publicada sobre el proceso de conversión, cuantización y rendimiento real en el dispositivo es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, LlamaForCausalLM (modelo base MiniCPM5-2B) |
| Parametros totales | 2.500 millones (2,5B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens (nativo, según model card del modelo base) |
| Tipos de cuantizacion | no disponible (formato RKNN3 para NPU RK1820; nivel de cuantización no especificado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | RKNN3 (artefacto para Rockchip RK1820); pesos originales del base en safetensors, no incluidos en esta ficha |
| Capas | 42 |
| Tamano del repositorio | 2,0 GB |
| Plataforma objetivo | Rockchip RK1820 |
| Runtime de despliegue | LlamaPi (`llamapi run minicpm5:2b`) |

## Arquitectura y entrenamiento
La arquitectura corresponde al modelo base MiniCPM5-2B: un transformer denso estándar de tipo LlamaForCausalLM, con 2,5B parámetros y 42 capas. La model card indica que fue post-entrenado con aprendizaje por refuerzo (RL) y destilación on-policy (OPD) sobre el corpus abierto UltraData, orientado a asistentes locales, agentes de código y flujos de uso de herramientas. No se detalla en la información disponible la composición exacta del dataset, el número de tokens de preentrenamiento ni los detalles del pipeline de RLHF/DPO.

La innovación de este artefacto concreto no está en el modelo, sino en la conversión: Firefly AI ha adaptado los pesos al formato RKNN3 para ejecutarse en la NPU del Rockchip RK1820 a través de LlamaPi, que gestiona descarga, carga y ejecución. No se especifican en la información proporcionada detalles técnicos de la conversión, como el esquema de cuantización, el soporte de operadores o las optimizaciones de memoria aplicadas.

## Capacidades
- Generación de texto conversacional en el pipeline `text-generation`.
- Razonamiento y matemáticas: el modelo base declara ventajas en matemáticas frente a otros modelos de su clase.
- Generación y asistencia de código: orientado a agentes de código según la model card del base.
- Comprensión de contexto largo: ventana nativa de 131.072 tokens.
- Uso de herramientas (tool calling / function calling): el base está diseñado para flujos de tool-use.
- Tareas agénticas y razonamiento multi-paso: el base se post-entrenó para escenarios agénticos.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible; el pipeline es únicamente de generación de texto.

## Casos de uso
- Asistente local en dispositivos Rockchip RK1820: el modelo se ejecuta íntegramente en la NPU del SoC mediante LlamaPi, lo que permite asistentes conversacionales sin conexión a la nube y con bajo consumo, adecuado para terminales industriales o paneles inteligentes.
- Agente de tool-use en el borde: gracias al entrenamiento del base en uso de herramientas y tareas agénticas, puede orquestar llamadas a APIs locales o sensores en un dispositivo embebido, con la ventaja de mantener los datos en el propio hardware.
- Procesamiento de documentos largos en local: la ventana de 131.072 tokens permite resumir manuales técnicos, contratos o registros extensos directamente en el dispositivo, sin enviar información sensible a servicios externos.
- Asistencia de código en entornos aislados: para desarrolladores que trabajan en redes air-gapped, el modelo puede ofrecer autocompletado y explicación de código en una estación Rockchip, manteniendo el código fuente dentro del perímetro.
- Automatización de atención al cliente en kioscos o terminales: conversaciones multi-turno con contexto amplio para resolver consultas frecuentes en comercio o administración, con latencia local y sin dependencia de conectividad.
- Educación y tutores offline: despliegue en dispositivos de bajo coste para asistencia educativa en zonas con conectividad limitada, aprovechando el tamaño de 2,5B y el contexto largo para sesiones de estudio prolongadas.
- Prototipado de agentes en hardware embebido: usar el artefacto RKNN3 como base para validar pipelines agénticos en RK1820 antes de escalar a producción, con el runtime LlamaPi simplificando la puesta en marcha.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card del artefacto no incluye métricas de MMLU, HumanEval, GSM8K ni latencia/throughput en el RK1820. La model card del base menciona de forma cualitativa estado del arte en la clase 2B y competitividad con modelos de 4B, pero sin cifras verificables en la información proporcionada.

## Requisitos de hardware
- Plataforma objetivo: Rockchip RK1820 con NPU; el artefacto está empaquetado en formato RKNN3 específicamente para este SoC.
- VRAM/RAM estimada: no disponible. El repositorio ocupa 2,0 GB, lo que da una cota inferior del espacio de almacenamiento necesario, pero no se especifica la memoria de trabajo en inferencia.
- GPU recomendadas: no aplica; el artefacto está pensado para la NPU del RK1820, no para GPU de escritorio.
- Compatibilidad con GPU de consumo: no disponible para este artefacto; los pesos originales del base podrían ejecutarse en GPU, pero no se documenta en esta ficha.
- Opciones de despliegue: LlamaPi (`llamapi run minicpm5:2b`); no se mencionan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Despliegue edge | Notas |
|---|---|---|---|---|---|
| MiniCPM5-2B-rknn3-rk1820 (este) | 2,5B | 131.072 | Apache 2.0 | RK1820 vía LlamaPi | Artefacto RKNN3 de Firefly |
| MiniCPM5-2B (openbmb) | 2,5B | 131.072 | Apache 2.0 (según base) | Multiplataforma | Modelo original, sin conversión |
| Alternativas de 2B de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento numérico con alternativas concretas; la comparativa se limita al modelo base y a la ausencia de datos de terceros.

## Limitaciones y advertencias
- Artefacto de despliegue, no modelo nuevo: las capacidades reales dependen del MiniCPM5-2B original; las mejoras o regresiones introducidas por la conversión RKNN3 no están documentadas.
- Cuantización no especificada: se desconoce el nivel de precisión (INT8, INT4 u otro) y su impacto en la calidad de las respuestas.
- Idiomas no declarados: no hay información sobre cobertura multilingüe ni calidad por idioma.
- Riesgo de alucinación: inherente a los modelos de 2,5B; no se han publicado evaluaciones de fidelidad para este artefacto.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Licencia: Apache 2.0 permite uso comercial, pero los derechos del modelo original pertenecen a OpenBMB y su distribución se rige por la licencia oficial correspondiente; conviene verificar la licencia del base antes de producción.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validación comunitaria.
- Dependencia de LlamaPi: el despliegue está atado al runtime de Firefly y al SoC RK1820; no es portable a otras plataformas sin reconversión.
- Contexto largo: aunque el base declara 131.072 tokens, no se confirma que la conversión RKNN3 preserve esa ventana completa en el dispositivo.

## Enlaces
- Hugging Face del artefacto: https://huggingface.co/t-firefly/minicpm5-2b-rknn3-rk1820
- Modelo base en Hugging Face: https://huggingface.co/openbmb/MiniCPM5-2B
- Modelo base en ModelScope: https://modelscope.cn/models/OpenBMB/MiniCPM5-2B
- Firefly AI Team: https://www.t-firefly.com/
- Documentación de LlamaPi: https://community.t-firefly.com/en/docs/ai/applications/LlamaPi/llamapi/introduction
- Licencia Apache 2.0: https://huggingface.co/licenses/apache-2.0
