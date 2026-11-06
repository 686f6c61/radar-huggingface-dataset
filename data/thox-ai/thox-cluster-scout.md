# Thox-ai/thox-cluster-scout

## Resumen

thox-cluster-scout es una distribución del modelo Qwen2.5-72B-Instruct de Alibaba Cloud, empaquetada y documentada por Thox-ai para inferencia local y despliegues sobre MeshStack, la tecnología de clustering dispositivo-a-dispositivo de THOX. No se trata de un modelo entrenado por THOX: los pesos son byte-idénticos a la distribución Ollama del proveedor original (verificado por SHA-256 en la revisión de release del 31 de octubre de 2026), y el trabajo de THOX se limita a la capa de configuración, orquestación y documentación que rodea a los pesos.

El modelo hereda la arquitectura transformer densa de Qwen2.5-72B-Instruct, con 72 000 millones de parámetros y una ventana de contexto de 128 000 tokens (servida con `num_ctx 131072` en la configuración de Ollama). Se distribuye cuantizado en Q4_K_M (GGUF) con un tamaño aproximado de 47 GB, lo que lo sitúa en el rango de despliegue en estaciones de trabajo con GPU de gama alta o en configuraciones multi-dispositivo mediante el pooling de recursos de MeshStack.

Su relevancia actual es acotada y muy específica: sirve como referencia para evaluar inferencia de modelos de clase 72B en entornos on-premises y para probar el reparto de carga entre dispositivos que propone el stack de THOX. La licencia es estrictamente no comercial (Qwen Research License Agreement), lo que restringe severamente su uso en producción empresarial sin un acuerdo adicional con el licenciante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen2.5-72B-Instruct) |
| Parametros totales | 72 000 millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 000 tokens (servido con num_ctx 131072) |
| Tipos de cuantizacion | Q4_K_M (GGUF); otras cuantizaciones no documentadas en esta distribución |
| Idiomas soportados | 100+ segun catalogo del modelo base; la model card declara solo `en` |
| Licencia | Qwen Research License Agreement (solo uso no comercial) |
| Formato de pesos | GGUF (distribución Ollama); el repositorio de Hugging Face solo contiene `.gitattributes` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-72B-Instruct: un transformer denso decoder-only con atención completa, sin componentes MoE ni mecanismos híbridos SSM. THOX no ha realizado fine-tuning, no ha aportado datasets adicionales y no reclama ningún procedimiento de entrenamiento propio; la model card indica explícitamente que los datos y el procedimiento de entrenamiento son los del proveedor del modelo base y remite a su ficha para ese registro.

La innovación atribuible a esta distribución no está en los pesos sino en el entorno: la integración con MeshStack y MagStack, un sistema de clustering físico (pines pogo magnéticos en dispositivos ThoxNova) y de malla inalámbrica patent-pending que permite repartir modelo, memoria y cómputo entre dispositivos. En la práctica, esto significa que la configuración está pensada para servir un modelo de 72B fragmentado entre varias máquinas, no para ejecutarse en un único nodo con suficiente VRAM.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredados de Qwen2.5-72B-Instruct.
- Generación y comprensión de código, con soporte para lenguajes de programación habituales del modelo base.
- Razonamiento matemático y resolución de problemas de varios pasos.
- Soporte de tool calling y function calling (capacidad del modelo base, no verificada de forma independiente en esta distribución).
- Capacidades multilingües amplias segun el catálogo del modelo base (100+ idiomas), aunque la model card de esta distribución declara únicamente inglés.
- Análisis de documentos largos gracias a la ventana de 128 000 tokens.
- Despliegue local vía Ollama y orquestación distribuida vía MeshStack (componente separado de la descarga).

## Casos de uso

- Evaluación de inferencia local a escala de departamento: desplegar el modelo en una estación de trabajo o pequeño clúster para medir latencia y calidad reales de un 72B cuantizado en Q4_K_M antes de comprometer infraestructura.
- Pruebas de pooling de recursos con MeshStack: distribuir el modelo entre varios dispositivos ThoxNova o nodos compatibles para validar el reparto de memoria y cómputo del stack de THOX con una carga de clase 72B.
- Análisis de documentos extensos en investigación: procesar contratos, informes o corpus técnicos de hasta 128 000 tokens en un entorno controlado y sin salida de datos a la nube.
- Asistencia a equipos de desarrollo en entorno air-gapped: generación y revisión de código sobre infraestructura local, sin dependencia de APIs externas, dentro de los límites de la licencia no comercial.
- Prototipado de asistentes conversacionales multi-turno: evaluar la coherencia en conversaciones largas con contexto extendido antes de migrar a un modelo con licencia comercial.
- Banco de pruebas para comparativas de cuantización: usar la build Q4_K_M como referencia para medir la degradación de calidad frente a pesos sin cuantizar del modelo base.
- Docencia y experimentación académica: entorno reproducible para estudiar el comportamiento de modelos de 72B en hardware modesto mediante reparto de carga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las cifras que pudieran citarse provienen del catálogo original de Alibaba para el modelo base, no han sido re-ejecutadas para esta publicación y la evaluación independiente de THOX está pendiente. No se ofrece ningún dato de throughput, latencia, concurrencia ni ahorro de costes para esta distribución.

## Requisitos de hardware

- VRAM estimada: en torno a 47 GB para la build Q4_K_M; se recomienda reservar 50-56 GB para margen de contexto y overhead del runtime.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU (por ejemplo, 2× RTX 4090 de 24 GB o 2× L40S) para servir el modelo completo en un solo nodo.
- GPU de consumo: no cabe en una única RTX 4090 (24 GB) ni en una RTX 3090; requiere reparto entre al menos dos GPU o el pooling multi-dispositivo de MeshStack.
- Opciones de despliegue: Ollama es el runtime oficial de esta distribución (`ollama run Thox-ai/thox-cluster-scout`); MeshStack actúa como capa de orquestación distribuida separada de la descarga. Otros runtimes compatibles con GGUF (llama.cpp) son teóricamente posibles pero no están documentados para esta build.
- Latencia y throughput: no disponibles; la model card elimina explícitamente cualquier cifra de rendimiento por falta de evidencia de despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| thox-cluster-scout | 72B | 128K | Qwen Research (no comercial) | GGUF Q4_K_M | Distribución de Qwen2.5-72B-Instruct con configuración MeshStack |
| Qwen2.5-72B-Instruct | 72B | 128K | Qwen Research / comercial bajo acuerdo | safetensors, GGUF | Modelo base original de Alibaba; pesos idénticos a esta distribución |
| Llama 3.3 70B Instruct | 70B | 128K | Llama Community License | safetensors, GGUF | Alternativa de tamaño comparable con licencia comunitaria que permite uso comercial con restricciones |
| Mistral Large 2 | 123B | 128K | Mistral Research / comercial | safetensors | Mayor tamaño y requisitos de hardware superiores; opción si se necesita más capacidad |

## Limitaciones y advertencias

- Licencia estrictamente no comercial: los pesos están bajo la Qwen Research License Agreement; cualquier uso comercial requiere un acuerdo separado con el licenciante. Versiones anteriores de la model card indicaban MIT y uso comercial, lo cual fue corregido por el propio autor.
- THOX no ha entrenado ni ajustado los pesos: no hay mejora alguna atribuible a esta distribución frente al modelo base; los pesos son byte-idénticos a la build de Ollama del proveedor.
- Sin benchmarks ni métricas de rendimiento verificadas: cualquier cifra de latencia, throughput o calidad debe medirse por el operador.
- Requisitos de hardware elevados: 47 GB en Q4_K_M implican GPU de 80 GB o reparto multi-dispositivo; el rendimiento depende enteramente de la infraestructura del operador.
- Idioma: la model card declara únicamente inglés, aunque el modelo base soporta más idiomas; el soporte multilingüe no está verificado en esta configuración.
- Riesgo de alucinación: inherente al modelo base; no hay evaluación específica de esta distribución.
- Dependencia de un ecosistema propietario: la orquestación MeshStack y el hardware ThoxNova son componentes de THOX, con disponibilidad y soporte ligados a su programa comercial.
- Idiomas y sesgos: no se documentan evaluaciones de sesgo para esta distribución; deben asumirse los del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/thox-cluster-scout
- Build ejecutable en Ollama: https://ollama.com/Thox-ai/thox-cluster-scout
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-72B-Instruct
- Sitio del fabricante: https://thox.ai
