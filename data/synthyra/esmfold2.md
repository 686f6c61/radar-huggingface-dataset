# Synthyra/ESMFold2

## Resumen

Synthyra/ESMFold2 es un modelo de lenguaje de proteínas (protein language model) desarrollado por Synthyra que empaqueta el checkpoint `biohub/ESMFold2` con el runtime FastPLMs para su uso a través de la interfaz estándar de Hugging Face Transformers. El modelo acepta secuencias de aminoácidos o especificaciones de complejos moleculares (proteínas, DNA, RNA, ligandos) y predice estructuras tridimensionales de alta resolución, con salida en formato PDB o CIF. Está pensado para tareas de predicción de estructura, diseño de proteínas y análisis de interacciones biomoleculares.

El modelo se presenta como el sucesor de ESMFold y establece un nuevo estado del arte en predicción de estructura a partir de secuencia única, con la opción de incorporar alineamientos múltiples de secuencias (MSA) para mejorar la precisión. Según la documentación disponible, supera a otros modelos en la tasa de aprobación DockQ en complejos proteína-proteína y anticuerpo-antígeno del conjunto Foldbench. Con 234,8 millones de parámetros, es un modelo relativamente compacto, lo que facilita su despliegue en entornos con recursos limitados.

La relevancia actual del modelo radica en su capacidad para abordar el plegamiento de proteínas y el diseño de interacciones con una velocidad de inferencia significativamente mayor que los métodos basados en MSA, manteniendo una precisión competitiva. Además, su licencia MIT permite su uso comercial sin restricciones, lo que lo convierte en una opción atractiva para aplicaciones industriales en biotecnología y farmacología.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (encoder) basado en ESMFold2, con runtime FastPLMs |
| Parametros totales | 234.822.979 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de secuencias de aminoacidos, no idiomas naturales) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura ESMFold2, que es un transformer codificador diseñado específicamente para secuencias de proteínas. A diferencia de ESMFold original, ESMFold2 incorpora un mecanismo de difusión para la generación de coordenadas atómicas y permite el condicionamiento con MSA cuando está disponible. El checkpoint empaquetado en este repositorio utiliza el runtime FastPLMs, que proporciona una implementación optimizada para Transformers, con soporte para backends de atención como `sdpa`, `eager` y `flex_attention`.

No se han publicado detalles sobre el entrenamiento de este checkpoint concreto: no se especifican el número de tokens de entrenamiento, la composición del dataset ni si se utilizaron técnicas de RLHF o DPO. La model card indica que las cabezas de clasificación de secuencia y token se inicializan aleatoriamente sobre el backbone preentrenado, por lo que requieren fine-tuning antes de ser interpretadas como predicciones. El modelo base está diseñado para predicción de estructura, mientras que las tareas de clasificación son capacidades adicionales que deben entrenarse.

## Capacidades

- Prediccion de estructura 3D de proteinas a partir de secuencia unica, con salida en formato PDB o CIF.
- Prediccion de estructuras de complejos biomoleculares que incluyen proteinas, DNA, RNA, ligandos y modificaciones covalentes.
- Condicionamiento opcional con MSA (alineamientos multiples de secuencia) para mejorar la precision.
- Extraccion de caracteristicas (feature extraction) de secuencias de aminoacidos, util para tareas de representacion y transfer learning.
- Clasificacion de secuencias y clasificacion a nivel de residuo (token classification), con cabezas entrenables sobre el backbone.
- Soporte para backends de atencion eficientes: `sdpa` y `flex_attention`, ademas del clasico `eager`.
- Generacion de estructuras con control de numero de loops de refinamiento y pasos de muestreo.
- Capacidad de manejar entradas tipadas para complejos multimolecula, incluyendo condiciones de bolsillo (pocket) y distogramas.

## Casos de uso

- Prediccion de estructura de proteinas de novo: el modelo puede plegar secuencias sin necesidad de MSA, lo que lo hace adecuado para proteinas sin homologos conocidos. Un investigador puede pasar una secuencia de aminoacidos y obtener coordenadas atomicas en formato PDB en un solo paso.
- Diseño de interacciones proteina-proteina: gracias a su alto rendimiento en DockQ, el modelo es util para predecir como dos proteinas interactuan entre si, lo que permite disenar mutaciones que estabilicen o debiliten la interaccion.
- Docking de anticuerpo-antigeno: el modelo puede predecir la estructura de complejos anticuerpo-antigeno, facilitando el diseño racional de anticuerpos terapeuticos.
- Descubrimiento de farmacos: al aceptar ligandos (definidos por SMILES) y DNA/RNA, el modelo puede predecir estructuras de complejos proteina-ligando, ayudando en la identificacion de sitios de union y en el diseño de moleculas candidatas.
- Clasificacion funcional de proteinas: tras un fine-tuning de la cabeza de clasificacion, el modelo puede asignar funciones biologicas a secuencias, por ejemplo, predecir si una proteina es una enzima o un factor de transcripcion.
- Anotacion de residuos funcionales: con la cabeza de token classification, se pueden identificar residuos clave en la secuencia (por ejemplo, sitios activos o de union), lo que es valioso para la ingenieria de proteinas.
- Generacion de proteinas funcionales: segun la documentacion de Biohub, el modelo permite buscar en el espacio latente del modelo ESMC para generar nuevas proteinas con funciones deseadas, aunque esta capacidad requiere acceso al modelo ESMC subyacente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La documentacion de GitHub menciona que ESMFold2 supera a otros modelos en la tasa de aprobacion DockQ en los conjuntos Foldbench de complejos proteina-proteina y anticuerpo-antigeno, pero no se proporcionan cifras concretas. Tampoco se ofrecen comparaciones con ESMFold, AlphaFold2 u otros modelos en terminos de TM-score, RMSD o velocidad de inferencia.

## Requisitos de hardware

- El modelo requiere una GPU con soporte CUDA. El entorno validado oficialmente es una NVIDIA GH200 en Linux aarch64.
- No se especifican requisitos minimos de VRAM, pero dado que el modelo tiene 234,8 millones de parametros y se distribuye en safetensors, una GPU con al menos 1-2 GB de VRAM podria ser suficiente para inferencia en precision FP16, aunque esto es una estimacion no confirmada.
- No se garantiza el funcionamiento en CPU, Windows o macOS para tareas de estructura; la documentacion indica que solo se ha validado en el entorno mencionado.
- Para despliegue, se puede utilizar el pipeline estandar de Transformers con `trust_remote_code=True`. Tambien es posible usar vLLM u otras herramientas de inferencia, aunque no se mencionan explicitamente.
- La inferencia con el backend `sdpa` es la recomendada para un rendimiento optimo. El backend `flex_attention` ofrece flexibilidad adicional pero puede requerir mas configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Synthyra/ESMFold2 | 234,8 M | No disponible | MIT | Hugging Face |
| ESMFold (original) | ~650 M | No disponible | MIT | Hugging Face |
| AlphaFold2 | ~93 M (Evoformer) + 8 M (Structure module) | No aplica | Apache 2.0 (codigo) | Codigo abierto, pesos con restricciones |
| ESMC 6B (base de ESMFold2) | 6 B | No disponible | No especificada | No publico |

ESMFold2 se posiciona como un sucesor directo de ESMFold, con mejoras en la prediccion de complejos y en la velocidad (modo de secuencia unica). AlphaFold2 es el estandar de referencia para prediccion de estructura, pero requiere MSA y es mas lento. La principal ventaja de ESMFold2 es su capacidad de trabajar sin MSA y su rendimiento superior en interacciones proteina-proteina, segun la documentacion. No se dispone de datos comparativos cuantitativos para una evaluacion objetiva.

## Limitaciones y advertencias

- El modelo requiere `trust_remote_code=True` al cargarlo, lo que implica ejecutar codigo remoto del repositorio. Esto supone un riesgo de seguridad si el repositorio se ve comprometido.
- Las cabezas de clasificacion de secuencia y token se inicializan aleatoriamente; sus salidas no son interpretables hasta que se realiza un fine-tuning.
- No se garantiza el funcionamiento en CPU o sistemas sin CUDA. El entorno validado es especificamente NVIDIA GH200 en Linux aarch64, por lo que otros entornos pueden presentar comportamientos inesperados.
- No se han publicado datos sobre la longitud maxima de secuencia soportada ni sobre el rendimiento en secuencias muy largas.
- El modelo puede producir estructuras con errores de plegamiento, especialmente en regiones de baja confianza (pLDDT bajo). Se recomienda validar las predicciones con herramientas experimentales.
- Aunque la licencia MIT permite uso comercial, el modelo empaqueta codigo de FastPLMs que puede tener dependencias adicionales; se debe revisar la licencia de cada componente.
- La documentacion menciona que el modelo soporta MSA condicionado, pero no se especifica como se construye el MSA ni su impacto en el rendimiento.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Synthyra/ESMFold2)
- [Variante Experimental](https://huggingface.co/Synthyra/ESMFold2-Experimental)
- [Variante Fast](https://huggingface.co/Synthyra/ESMFold2-Fast)
- [Pagina de Synthyra sobre ESMFold2 y Test-Time Compute](https://synthyra.com/models/esmfold-ttt)
- [Biohub Platform - ESMFold2](https://www.biohub.ai/models/esmfold2)
- [Repositorio GitHub de referencia (atong01/esmfold2)](https://github.com/atong01/esmfold2/blob/main/README.md)
