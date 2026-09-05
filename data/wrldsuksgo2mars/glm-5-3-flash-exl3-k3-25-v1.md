# wrldsuksgo2mars/GLM-5.3-Flash-EXL3-K3.25-v1

## Resumen

GLM-5.3-Flash-EXL3-K3.25-v1 es una cuantización no oficial del modelo GLM-5.3-Flash-BF16, desarrollada por el usuario wrldsuksgo2mars. Se trata de un modelo multimodal de mezcla de expertos (MoE) con 73.089 millones de parámetros, diseñado para procesar imágenes y texto. La cuantización se aplica exclusivamente a los expertos enrutados en las capas 3 a 44, mediante el esquema EXL3 K3.25, que combina precisión de 3 bits con promociones selectivas de proyecciones clave a 4 bits. El resto de la arquitectura (atención, MLP densos, expertos compartidos, normas, embeddings y visión) se mantiene en precisión nativa BF16. El checkpoint resultante ocupa 136.16 GiB y está pensado para ejecutarse en una configuración de dos GPUs mediante un runtime personalizado, ya que no es compatible con vLLM estándar. La relevancia de este modelo radica en permitir el despliegue de un modelo de 73B con menor huella de memoria que el original, aunque a costa de requerir una infraestructura específica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (pipeline image-text-to-text) |
| Parametros totales | 73.089.112.926 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 K3.25 (3 bits con promociones a K4 en expertos enrutados); atención, MLP densos, expertos compartidos, routers, normas, embeddings y visión en precisión nativa |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (18 shards, 136.16 GiB) |

## Arquitectura y entrenamiento

El modelo base, GLM-5.3-Flash-BF16, es una arquitectura de transformer con mezcla de expertos (MoE) multimodal. La cuantización se realizó con GPTQModel y el algoritmo EXL3 MCG, con semilla 787 y `sigma_reg=0.025`. Se utilizaron 1.426 registros de calibración. La promoción de proyecciones a K4 sigue una asignación presupuestaria de 3:5:8 entre gate, up y down, con 1.701, 2.835 y 4.536 proyecciones respectivamente. El módulo MTP (predicción multi-token) de la capa 45 se dejó en K3. No se proporcionan detalles sobre el preentrenamiento del modelo base.

## Capacidades

- Procesamiento de imágenes y texto: el pipeline `image-text-to-text` permite recibir entradas multimodales en una misma solicitud.
- Generación de texto conversacional, según las etiquetas del repositorio.
- Predicción multi-token (MTP): la capa 45 implementa un módulo MTP cuantizado en K3, lo que puede acelerar la decodificación.
- Posible soporte de llamadas a herramientas (tool calling): la validación de la carga incluye cinco escenarios estrictos de tool call, aunque la documentación no especifica la implementación en el runtime.
- Topología MoE: los expertos enrutados se cuantizan de forma selectiva, mientras que los shared experts permanecen en precisión nativa.

## Casos de uso

- Análisis de documentos con contenido visual: el modelo puede procesar capturas de pantalla, gráficos y texto, lo que permite automatizar la extracción de información en contextos administrativos o técnicos.
- Asistencia conversacional multimodal en entornos con recursos limitados: gracias a la cuantización, es posible ejecutar un modelo de 73B en un sistema de dos GPUs, en lugar de un clúster completo.
- Prototipado de agentes con tool calling: el runtime personalizado incluye validación de escenarios de llamado a funciones, por lo que el modelo puede usarse para probar agentes que invocan herramientas externas.
- Investigación en técnicas de cuantización de MoE: la asignación asimétrica K3/K4 en gate/up/down es un caso de estudio para optimizar el equilibrio entre calidad y tamaño.
- Generación de descripciones técnicas de imágenes: al combinar entendimiento visual y de texto, puede producir informes o resúmenes de imágenes en dominios como medicina, ingeniería o documentación.
- Despliegue en aplicaciones con requisitos de privacidad: al requerir un runtime específico, puede integrarse en entornos controlados donde se eviten servicios cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no se dispone de una cifra oficial; el checkpoint ocupa 136.16 GiB, por lo que se necesitan al menos dos GPUs cuya memoria combinada supere ese tamaño.
- El repositorio de serving asociado está configurado para una máquina con dos RTX, lo que apunta a GPUs de gama alta (por ejemplo, RTX 6000 Ada o superiores).
- No es viable en una GPU de consumo como la RTX 4090 (24 GB), dado el tamaño del checkpoint.
- Opciones de despliegue: runtime personalizado en `https://github.com/tpurtell/glm-5.3-flash-ext3-4-bit-2x-rtx`. No es compatible con vLLM estándar; se menciona un puerto B12x en vLLM para esta configuración.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-BF16 (base) | 73.089.112.926 | no disponible | no disponible | no disponible | HuggingFace |
| GLM-5.3-Flash-EXL3-K3-v1 | no disponible | no disponible | no disponible | MIT | HuggingFace |
| GLM-5.3-Flash-EXL3-K3.25-v1 (este modelo) | 73.089.112.926 | no disponible | no disponible | MIT | HuggingFace |

## Limitaciones y advertencias

- Cuantización no oficial; el autor no es Z.ai, la organización responsable del modelo base.
- No es compatible con vLLM estándar; requiere un runtime personalizado, lo que limita su integración en plataformas de despliegue habituales.
- El peso del checkpoint (136.16 GiB) es elevado para una cuantización de 3 bits, debido a que no todos los tensores están cuantizados.
- No se han publicado benchmarks ni evaluaciones de calidad, por lo que el impacto de la cuantización en el rendimiento es desconocido.
- No hay información sobre sesgos, idiomas soportados ni comportamientos de seguridad.
- La licencia MIT del checkpoint cuantizado no garantiza la licencia del modelo base; debe verificarse en el repositorio original de Z.ai.
- La cuantización selectiva puede producir degradaciones en tareas sensibles, especialmente en los expertos enrutados con el esquema K3.

## Enlaces

- Página del modelo: https://huggingface.co/wrldsuksgo2mars/GLM-5.3-Flash-EXL3-K3.25-v1
- Variante K3-v1 del mismo autor: https://huggingface.co/wrldsuksgo2mars/GLM-5.3-Flash-EXL3-K3-v1
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash-BF16
- Repositorio de serving: https://github.com/tpurtell/glm-5.3-flash-ext3-4-bit-2x-rtx
