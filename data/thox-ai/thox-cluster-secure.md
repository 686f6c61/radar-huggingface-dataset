# Thox-ai/thox-cluster-secure

## Resumen

thox-cluster-secure es una distribución configurada por THOX.ai sobre el modelo base Qwen2.5-72B-Instruct de Alibaba Cloud. No se trata de un modelo entrenado desde cero ni de un fine-tuning: los pesos son byte-idénticos a la distribución Ollama upstream de Qwen2.5-72B-Instruct (verificado por SHA-256 según la model card), y el trabajo de THOX se limita a la capa de configuración, el system prompt orientado a seguridad y la documentación para despliegues locales aislados de red.

El modelo se presenta como parte del ecosistema MeshStack/MagStack de THOX, una tecnología de clustering dispositivo-a-dispositivo pensada para repartir inferencia entre hardware propio. La distribución se sirve en formato GGUF con cuantización Q4_K_M (47 GB) y se ejecuta mediante Ollama, con una ventana de contexto configurada de 131.072 tokens.

Es relevante ahora por dos motivos: por un lado, documenta un patrón de despliegue de inferencia local en entornos air-gapped con un modelo de 72B; por otro, su model card incluye una corrección explícita de afirmaciones previas sobre certificaciones (ITAR, FedRAMP, FISMA, CMMC) que THOX retiró por no disponer de ellas. La licencia es la Qwen Research License, solo para uso no comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-72B-Instruct) |
| Parámetros totales | 72B |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens (num_ctx configurado en Ollama; la etiqueta latest de Ollama muestra 32K como artefacto de visualización) |
| Tipos de cuantización | Q4_K_M (GGUF) |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | Qwen Research License Agreement (solo uso no comercial) |
| Formato de pesos | GGUF (distribución Ollama); repositorio HF con fichero .gitattributes de 1.519 B |
| Tamaño de la distribución | 47 GB |
| Modelo base | Qwen/Qwen2.5-72B-Instruct |
| Despliegue | Ollama local; orquestación distribuida vía MeshStack (componente separado) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-72B-Instruct, un transformer decoder-only de 72.000 millones de parámetros desarrollado por Alibaba Cloud. THOX no aporta cambios en los pesos: la model card afirma que la capa de pesos es byte-idéntica a la distribución Ollama del proveedor original, verificada por SHA-256 en la revisión de release del 31 de octubre de 2026, y que comparte el mismo digest que thox-cluster-scout, del que solo difiere en system prompt y presentación.

No hay entrenamiento, fine-tuning, dataset ni procedimiento de RLHF/DPO propio de THOX. Los datos de entrenamiento y el procedimiento son los del modelo base de Qwen, y la model card remite a la ficha original para ese registro. La contribución técnica declarada se sitúa en la capa de clustering MeshStack/MagStack (reparto de cómputo, memoria y carga entre dispositivos, con tecnología mesh patent-pending) y en la configuración de runtime, no en el modelo.

## Capacidades

- Generación de texto en inglés, heredada de Qwen2.5-72B-Instruct.
- Razonamiento, código y matemáticas: capacidades del modelo base, no re-evaluadas por THOX.
- Instrucciones: el modelo base es la variante Instruct, por lo que responde a formato conversacional.
- Tool calling y function calling: no documentado explícitamente en esta distribución; debe verificarse contra la ficha de Qwen2.5-72B-Instruct.
- Soporte de agentes y razonamiento multi-paso: no documentado en esta ficha.
- Multilingüismo: la model card declara únicamente inglés (en), aunque el modelo base soporta más idiomas.
- Capacidad especial de esta distribución: system prompt orientado a seguridad y despliegue en entornos aislados de red (air-gapped).
- Inferencia distribuida multi-dispositivo mediante MeshStack (componente externo a la descarga).

## Casos de uso

- Evaluación de inferencia de gran modelo en redes aisladas: el modelo se ejecuta con Ollama en infraestructura propia sin conexión saliente, lo que permite a equipos de seguridad evaluar tooling de IA local bajo condiciones controladas.
- Laboratorios de investigación con requisitos de confidencialidad: al no salir datos del perímetro, sirve para experimentar con un modelo de 72B en entornos donde no se permite tráfico a APIs externas.
- Pruebas de clustering de cómputo con MeshStack: el modelo está pensado para repartir carga entre dispositivos ThoxNova mediante MagStack (conexión física por pogo pins magnéticos) o MeshStack (mesh over-air), útil para validar orquestación distribuida de inferencia.
- Evaluación comparativa de configuraciones: al compartir pesos con thox-cluster-scout, permite comparar el efecto de distintos system prompts (seguridad frente a estándar) manteniendo constantes los pesos.
- Formación y demos internas de despliegue local: sirve para mostrar a equipos de infraestructura el ciclo completo de pull, ejecución y configuración de contexto de un modelo de 72B cuantizado en Q4_K_M.
- Baseline para evaluación de seguridad de modelos: un equipo puede auditar el comportamiento del system prompt endurecido frente al estándar en tareas de cumplimiento y filtrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que las cifras citadas en su día provenían de Alibaba (Qwen) para el modelo base, reproducidas del catálogo original, y que no se re-ejecutaron para esta publicación. La evaluación independiente de THOX figura como pendiente. No se dispone de datos verificados de MMLU, HumanEval, GSM8K ni de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: la distribución Q4_K_M ocupa 47 GB, por lo que se necesita al menos ~48 GB de memoria unificada o VRAM para cargar los pesos, más overhead de contexto (los 131.072 tokens de ventana incrementan sustancialmente el consumo de KV cache).
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, un despliegue en una sola GPU requiere tarjetas de 80 GB (A100, H100) o configuraciones multi-GPU.
- Consumer GPU: no cabe en GPUs de consumo de 24 GB (RTX 4090) en una sola unidad con Q4_K_M; requeriría reparto entre varias o el clustering MeshStack.
- Opciones de despliegue: Ollama (método documentado: `ollama pull` / `ollama run`); orquestación distribuida mediante MeshStack. No se documentan vLLM, llama.cpp directo ni TGI para esta distribución.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thox-cluster-secure | 72B | 131.072 | Q4_K_M (GGUF) | Qwen Research (no comercial) | Ollama + HF |
| Qwen2.5-72B-Instruct (upstream) | 72B | 131.072 (modelo base) | múltiples | Qwen Research / comercial bajo licencia | HF, Ollama |
| thox-cluster-scout | 72B | 131.072 | Q4_K_M (GGUF) | Qwen Research (no comercial) | Ollama (mismos pesos, distinto system prompt) |
| Llama 3.3 70B Instruct | 70B | 128K | múltiples | Llama Community License | HF, Ollama |

La comparación relevante es con el propio upstream: thox-cluster-secure no aporta pesos distintos, solo configuración y empaquetado. Frente a Llama 3.3 70B, el contexto y el tamaño son comparables, pero la licencia de Qwen Research restringe el uso comercial, lo que limita su adopción en producción frente a alternativas con licencia permisiva.

## Limitaciones y advertencias

- Licencia: Qwen Research License Agreement, solo uso no comercial. Cualquier uso comercial requiere licencia separada del licenciante. La model card corrige una atribución previa errónea a MIT.
- Certificaciones: THOX retiró explícitamente las afirmaciones sobre ITAR, FedRAMP, FISMA, CMMC, niveles UNCLASSIFIED-SECRET y control de acceso CAC/PIV. No hay certificación, acreditación ni autorización de ningún tipo para este modelo.
- Idiomas: la ficha declara solo inglés; el rendimiento en castellano u otros idiomas no está documentado y puede degradarse respecto al modelo base.
- Alucinación: al ser una distribución sin evaluación propia, no hay datos de THOX sobre tasas de alucinación; aplican los riesgos del modelo base.
- Sesgos: no documentados en esta ficha; heredados del modelo base de Qwen.
- Contexto: aunque se configura num_ctx 131.072, la etiqueta latest de Ollama muestra 32K, lo que puede inducir a error en el despliegue; hay que verificar la configuración efectiva.
- Repositorio HF: el repositorio público contiene únicamente un fichero .gitattributes; los pesos ejecutables se sirven desde Ollama, no desde Hugging Face.
- Evaluación pendiente: no hay benchmarks independientes de THOX; las cifras del catálogo original no están verificadas.
- Dependencia de MeshStack: la orquestación distribuida es un componente separado de la descarga y no está incluida en el modelo.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/thox-cluster-secure
- Ollama: https://ollama.com/Thox-ai/thox-cluster-secure
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-72B-Instruct
- Sitio de THOX: https://thox.ai
- Campaña Kickstarter de THOX (MeshStack): https://thox.ai
