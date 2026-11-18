# Vxtzq/Crowd-v1

## Resumen

Crowd-v1 es un modelo de lenguaje de aproximadamente 1.000 millones de parametros desarrollado por Vxtzq dentro del proyecto CrowdGPT, una iniciativa de entrenamiento distribuido y comunitario. Se distribuye bajo licencia MIT y su proposito principal no es el de un modelo preentrenado listo para produccion, sino el de proporcionar una definicion de arquitectura y un formato de pesos comunes que los clientes de CrowdGPT puedan descargar y entrenar de forma colectiva. El modelo se encuentra en estado de preentrenamiento activo, con 42.000 millones de tokens procesados hasta la fecha de la model card.

Arquitectonicamente es un transformer decoder-only de 24 capas con atencion de consultas agrupadas (GQA, 16 cabezas de atencion y 4 cabezas KV), dimension oculta de 1536, MLP SwiGLU con dimension intermedia de 2560, embeddings rotatorios (RoPE) y weight tying entre la capa de entrada y la de salida. Incorpora un componente poco habitual denominado EngramMemory, una tabla de embeddings dispersa de 227.865 buckets que reside en CPU y aporta unos 350 millones de parametros adicionales en CPU, lo que explica la diferencia entre el recuento de safetensors y el total efectivo del sistema.

Su relevancia actual es fundamentalmente experimental y de investigacion: ilustra un enfoque de entrenamiento descentralizado tipo "volunteer computing" aplicado a modelos de lenguaje, y su interes tecnico radica en la memoria Engram y en la infraestructura de entrenamiento distribuido. No debe evaluarse como un modelo alternativo a los modelos preentrenados convencionales de su tamano, ya que sus pesos contienen solo conocimiento linguistico parcial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA, RoPE y SwiGLU |
| Parametros totales | 1.007.787.032 (safetensors) + ~350M en CPU (EngramMemory) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible (la model card declara `ia`, sin detalle) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model_bf16.safetensors`, `engram_bf16.safetensors`) |
| Vocabulario | 151.669 tokens |
| Dimension oculta | 1536 |
| Capas | 24 |
| Cabezas de atencion / KV | 16 / 4 |
| Dimension de cabeza | 96 |
| Dimension MLP | 2560 |
| Weight tying | Si |
| Inicializacion | Normal, sigma = 0.02 |
| Tamano del repo | 2.815,7 GB |

## Arquitectura y entrenamiento

El modelo sigue una pila transformer clasica con normalizacion LayerNorm pre-norm, atencion causal con GQA (ratio de repeticion 4:1) y RoPE con theta de 10.000. El MLP es SwiGLU de tres matrices sin sesgo, y los embeddings de entrada y la proyeccion de salida comparten pesos. La innovacion mas destacable es EngramMemory: una tabla de embeddings dispersa de 227.865 buckets y dimension 1536 que se mantiene en CPU, se consulta mediante un hash de pares de tokens consecutivos (`(prev * 1000003 + curr) % num_buckets`) y se inicializa con la misma distribucion normal. Este mecanismo actua como una memoria de n-gramas aprendida, separada de los pesos principales y entrenable con actualizaciones dispersas.

El entrenamiento se realiza de forma distribuida y comunitaria sobre los datasets `openbmb/Ultra-FineWeb-L3`, `HuggingFaceFW/fineweb` y `Vxtzq/CrowdGPT`, con 42.000 millones de tokens procesados hasta la fecha. No se documentan en la informacion disponible detalles sobre la composicion exacta del dataset, el uso de RLHF/DPO, la tokenizacion empleada ni la receta de optimizacion. El codigo de inferencia publicado es explicito en que se trata de una version de prueba que sera deprecada en futuras versiones, y carga los pesos manualmente en lugar de usar `trust_remote_code` de forma estandar.

## Capacidades

- Generacion de texto autoregresiva basica, condicionada por el estado parcial del preentrenamiento.
- Razonamiento y coherencia limitados: la propia model card advierte que no debe esperarse texto muy coherente.
- Conocimiento linguistico parcial adquirido tras 42.000 millones de tokens.
- Memoria de n-gramas via EngramMemory, orientada a mejorar la prediccion local de secuencias.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no documentadas.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion en entrenamiento distribuido: servir como definicion de referencia y formato de pesos para nodos que contribuyen computo al proyecto CrowdGPT, permitiendo entrenamiento colectivo con actualizaciones sincronizadas.
- Estudio de memorias tipo Engram: analizar el impacto de una tabla de n-gramas hash en CPU sobre la perplejidad de un transformer pequeno, comparando con baselines sin Engram.
- Docencia y prototipado de arquitecturas: usar el codigo de inferencia publicado como ejemplo didactico de implementacion manual de GQA, RoPE y SwiGLU sin dependencias de alto nivel.
- Experimentos de preentrenamiento a pequena escala: partir de los pesos parciales para fine-tuning en dominios concretos y medir la transferibilidad de un checkpoint intermedio.
- Benchmarking de infraestructura de inferencia: evaluar latencia y throughput de un modelo de 1B con componente CPU-side en distintos runtimes.
- Reproducibilidad de checkpoints intermedios: estudiar como evoluciona la calidad del texto a lo largo del preentrenamiento guardando snapshots periodicos.
- No recomendado para atencion al cliente, generacion de codigo en produccion, agentes autonomos ni aplicaciones orientadas a usuario final en su estado actual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2 GB para los pesos del transformer (1.007.787.032 parametros x 2 bytes), mas overhead de activaciones y cache KV para 2048 tokens.
- Memoria RAM adicional: la EngramMemory requiere aproximadamente 350 millones de parametros en CPU (unos 700 MB en bf16 o 1,4 GB en fp32), mas el coste de la tabla dispersa.
- GPU recomendadas: cualquier GPU consumer con al menos 6-8 GB de VRAM es suficiente para el transformer; una RTX 3060, RTX 4060, RTX 4090 o superior cubren el modelo con holgura. Para entrenamiento distribuido, A100 o H100 segun la infraestructura del proyecto.
- Cabe en GPU consumer: si, en la mayoria de tarjetas modernas con 8 GB o mas.
- Opciones de despliegue: el codigo publicado es Python/PyTorch manual con `safetensors`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. La integracion con `transformers` requeriria `trust_remote_code` y codigo personalizado (tag `custom_code`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| Crowd-v1 | ~1B (+350M CPU) | 2048 | MIT | Preentrenamiento en curso | Distribuido, comunitario, EngramMemory |
| TinyLlama-1.1B | 1,1B | 2048 | Apache 2.0 | Preentrenado y ajustado | Baseline convencional de 1B |
| OLMo-1B | ~1,2B | 2048 | Apache 2.0 | Preentrenado, checkpoints abiertos | Proyecto abierto con receta completa |
| Pythia-1B | 1,0B | 2048 | Apache 2.0 | Preentrenado, checkpoints multiples | Suite de interpretabilidad |

La comparacion es orientativa: los tres alternativas son modelos preentrenados completos con recetas documentadas, mientras que Crowd-v1 es un checkpoint intermedio de un experimento de entrenamiento distribuido. No se dispone de datos de rendimiento comparables para Crowd-v1.

## Limitaciones y advertencias

- Modelo en preentrenamiento: los pesos son parciales y la calidad del texto generado es baja segun la propia model card.
- Riesgo elevado de alucinacion y salidas incoherentes por el estado incompleto del entrenamiento.
- Ventana de contexto limitada a 2048 tokens, insuficiente para tareas de contexto largo.
- Idiomas soportados no documentados; el tag `ia` no aclara la cobertura linguistica real.
- El codigo de inferencia publicado sera deprecado y no sigue la interfaz estandar de `transformers`.
- La EngramMemory introduce una dependencia de CPU que complica el despliegue en entornos puramente GPU y en servicios serverless.
- Licencia MIT permite uso comercial, pero el estado del modelo hace inviable su uso en produccion con garantias de calidad.
- El tamano del repositorio (2,8 TB) puede deberse a checkpoints intermedios; conviene revisar los archivos antes de descargar.
- No hay informacion sobre sesgos, filtrado de datos ni evaluaciones de seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/Vxtzq/Crowd-v1
- Repositorio GitHub: https://github.com/Vxtzq/CrowdGPT
- Sitio del proyecto: https://crowdgpt.net
- Dataset Ultra-FineWeb-L3: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Dataset CrowdGPT: https://huggingface.co/datasets/Vxtzq/CrowdGPT
