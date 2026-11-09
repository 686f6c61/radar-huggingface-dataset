# udbbdh/armesh-vertexregen

## Resumen

ARMesh y VertexRegen son dos generadores de mallas 3D con representación progresiva (level-of-detail) publicados por el usuario udbbdh en un único repositorio de Hugging Face. ARMesh (NeurIPS 2025) genera mallas de forma autorregresiva prediciendo el siguiente nivel de detalle mediante divisiones de vértices sobre un complejo simplicial. VertexRegen (ICCV 2025) es una reimplementación no oficial que usa un modelo de lenguaje causal OPT como base y aplica divisiones de vértices a continuación, con una condición adicional de nube de puntos aportada por el codificador Michelangelo.

El repositorio no es una librería de pesos lista para usar, sino un volcado de trabajo de 63,7 GB que contiene código, configuraciones, datos de entrenamiento tokenizados, checkpoints completos (incluido el estado del optimizador) y resultados de inferencia. Los dos checkpoints incluidos son el mejor de cada modelo: ARMesh exp/1 con `d_model` 768 (paso global 1.972.801, época 199) y VertexRegen sobre OPT-350m con cross-attention de nube de puntos (paso 59.520 de 59.520).

La relevancia es doble: por un lado, ofrece material reproducible de dos trabajos de investigación recientes sobre generación de mallas; por otro, expone las limitaciones prácticas de un artefacto de investigación sin empaquetar, con rutas absolutas codificadas, dependencias externas ausentes y una licencia "other" sin términos publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ARMesh: transformer autorregresivo sobre complejo simplicial (predicción del siguiente nivel de detalle). VertexRegen: OPT causal LM (350M) con cross-attention de nube de puntos (codificador Michelangelo) |
| Parámetros totales | ARMesh: no disponible (`d_model` 768). VertexRegen: 350M (OPT-350m) más el codificador de nube de puntos |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo 3D, no lingüístico) |
| Licencia | other (sin términos publicados en la información disponible) |
| Formato de pesos | DeepSpeed checkpoint directory (ARMesh); `model.safetensors` (VertexRegen) |

## Arquitectura y entrenamiento

ARMesh formula la generación de mallas como una secuencia de niveles de detalle: parte de una malla base y en cada paso predice divisiones de vértices (vertex splits) sobre un complejo simplicial, de forma autorregresiva. El checkpoint incluido corresponde a la variante exp/1, incondicional o condicionada por embedding de objeto, con `d_model` 768, guardada tras 1.972.801 pasos globales (época 199) con la tasa de aprendizaje ya decaída a 1e-5. La métrica de entrenamiento `accuracy_cond_overall` alcanza 0,811, la más alta de todas las ejecuciones exp/1; las continuaciones posteriores, reiniciadas con una tasa mayor, se quedaron en 0,775.

VertexRegen emplea un OPT-350m causal como modelo de lenguaje sobre una malla base y aplica después divisiones de vértices. Sobre esta base se añade una condición de nube de puntos mediante el codificador Michelangelo, que se entrenó sin congelar sobre Objaverse. El checkpoint final completa los 59.520 pasos con una pérdida de evaluación de 0,5515 (la más baja de la ejecución) y una precisión de token de evaluación de 0,819. Los datos de entrenamiento incluidos son versiones colapsadas de ShapeNet y Objaverse en formato Hugging Face, junto con 412.963 ficheros PSC preprocesados para la variante exp/2 de ARMesh, repartidos en ocho fragmentos.

## Capacidades

- Generación de mallas 3D poligonales mediante predicción autorregresiva de niveles de detalle (divisiones de vértices).
- Representación progresiva: la malla se construye de grueso a fino, lo que permite truncar la generación para obtener versiones de baja resolución.
- Condicionamiento por nube de puntos en VertexRegen (codificador Michelangelo), útil para reconstrucción o generación guiada por geometría parcial.
- Condicionamiento por embedding de objeto en ARMesh exp/1.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No es un modelo multilingüe ni procesa texto libre; los tags del repositorio son exclusivamente 3D.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación reproducible en generación de mallas: el repositorio incluye código, configuraciones, datos tokenizados y checkpoints con estado del optimizador, lo que permite reanudar entrenamiento o reproducir la inferencia de los papers.
- Prototipado de pipelines de level-of-detail: truncando la secuencia de divisiones de vértices se obtienen mallas de distinta resolución a partir de una sola pasada, adecuado para experimentar con presupuestos de polígonos.
- Reconstrucción asistida por nube de puntos: VertexRegen acepta una condición de nube de puntos vía Michelangelo, lo que sirve para probar reconstrucción de mallas a partir de escaneos parciales en entornos de laboratorio.
- Comparación de paradigmas de generación 3D: al convivir ARMesh (transformer sobre complejo simplicial) y VertexRegen (OPT con cross-attention), el repositorio facilita experimentos comparativos con los mismos datos de ShapeNet y Objaverse.
- Extracción de datos preprocesados: los 412.963 ficheros PSC y los binarios empaquetados con vocabularios BPE pueden reutilizarse para entrenar otros modelos de mallas sin repetir el preprocesado.
- Docencia y análisis de artefactos de investigación: el repositorio ilustra de forma explícita los problemas de reproducibilidad (rutas absolutas, checkpoints ausentes, dependencias externas) y sirve como caso de estudio de empaquetado deficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos numéricos son métricas internas de entrenamiento y evaluación:

| Modelo | Métrica | Valor |
|---|---|---|
| ARMesh exp/1 | `accuracy_cond_overall` (entrenamiento) | 0,811 |
| ARMesh exp/1 | Paso global / época | 1.972.801 / 199 |
| VertexRegen (OPT-350m + PC) | Pérdida de evaluación | 0,5515 |
| VertexRegen (OPT-350m + PC) | Precisión de token de evaluación | 0,819 |
| VertexRegen (OPT-350m + PC) | Pasos completados | 59.520 / 59.520 |

## Requisitos de hardware

- El repositorio completo ocupa 63,7 GB, por lo que se necesita al menos ese espacio libre en disco antes de extraer los archivos.
- VRAM para inferencia: no disponible de forma explícita. VertexRegen se apoya en OPT-350m, lo que en FP16 supone del orden de 0,7 GB solo para los pesos del LM, más el codificador Michelangelo y las activaciones; el script de inferencia se lanza con `--num-processes=4`, lo que sugiere ejecución multi-GPU o multi-proceso.
- ARMesh: tamaño de checkpoint no desglosado en la información disponible; al ser un checkpoint de DeepSpeed con estado del optimizador, el requisito de memoria para reanudar entrenamiento es sustancialmente mayor que para inferencia.
- GPU recomendadas: no disponibles. No se documentan pruebas en A100, H100 ni RTX 4090.
- Viabilidad en GPU de consumo: no confirmada. Por el tamaño de OPT-350m, VertexRegen podría caber en GPUs de consumo con suficiente VRAM, pero no hay datos publicados que lo verifiquen.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. La inferencia se realiza con scripts propios (`exp/1/6-gen.py` para ARMesh y `launch.py ... infer.py` para VertexRegen) y requiere flash-attn (se incluyen wheels en el archivo de ARMesh).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ARMesh (este repo) | no disponible (`d_model` 768) | no disponible | `accuracy_cond_overall` 0,811 (métrica interna) | other | Checkpoint exp/1 incluido; exp/2 con nube de puntos ausente |
| VertexRegen (este repo) | 350M (OPT-350m) + codificador PC | no disponible | Pérdida eval 0,5515; precisión de token 0,819 | other | Checkpoint completo incluido |
| Alternativas de generación de mallas 3D | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (generación autorregresiva de mallas con level-of-detail) en el material proporcionado.

## Limitaciones y advertencias

- Licencia "other" sin texto de licencia publicado: no se puede determinar si el uso comercial está permitido. Tratarlo como no apto para producción hasta aclararlo con el autor.
- El repositorio no es un paquete instalable: el código usa rutas absolutas bajo `/root/junkai_lin/`, por lo que hay que extraer los archivos en esa ruta o editar las rutas manualmente.
- Falta el checkpoint de ARMesh exp/2 condicionado por nube de puntos (`out/exp-2--2026-09-03--16-47-32/ARMesh-PC/nlwxo9ui`), entrenado en otra máquina; no es posible reproducir esa variante.
- Falta el directorio `armesh/transfer/` y el checkpoint `shapevae-256.ckpt` de Michelangelo, necesario para construir el codificador congelado de ARMesh exp/2. VertexRegen solo emite un aviso si falta, porque su checkpoint ya incorpora el codificador.
- La configuración `exp/1/cfg.yaml` apunta a una ejecución eliminada en el campo `resume`, por lo que hay que pasar la ruta del checkpoint explícitamente al generar.
- Solo se conserva el mejor checkpoint de cada modelo; los intermedios y descartados fueron borrados, lo que impide estudiar curvas de entrenamiento completas.
- No hay datos publicados sobre sesgos, tasas de alucinación geométrica ni calidad de malla fuera de las métricas internas de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes, sin pipeline declarado ni idiomas: no hay señal de validación por parte de la comunidad.
- La fecha de creación (2026-11-09) y el tamaño desproporcionado para un artefacto de investigación sugieren que conviene verificar la integridad de los archivos antes de confiar en ellos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/udbbdh/armesh-vertexregen
- No se han encontrado en la información disponible enlaces adicionales a papers, blogs, repositorios de código o demos de ARMesh (NeurIPS 2025) ni de VertexRegen (ICCV 2025).
