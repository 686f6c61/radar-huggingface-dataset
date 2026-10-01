# zeechimp/provenance_reconstruct

## Resumen
`provenance-reconstruct` es una herramienta de reconstruccion de procedencia publicada por el usuario zeechimp en HuggingFace. No es un modelo de lenguaje ni un transformer: es un perceptron multicapa (MLP) minúsculo escrito en NumPy, de entre 387 y 515 parametros, que se entrena desde cero en el arranque y en CPU. Su funcion es leer un numero desnudo (por ejemplo, el resultado de un solver, o un recuento de tokens) e inferir que lo produjo, emitiendo una etiqueta de procedencia acompanada de una confianza calibrada.

El problema que aborda es concreto: cuando un valor numerico cruza una frontera (una API, un serializador, un tokenizador, un log), pierde los metadatos que lo hacian interpretable. El consumidor recibe `5.9971` sin saber si el solver convergio, que plantilla se uso o cuantos tokens se contaron realmente. El modelo actua como complemento del lado del consumidor respecto a otras dos herramientas de la misma serie, `numerical-provenance` y `token-provenance`, que operan del lado del productor y registran procedencia observada.

Es relevante ahora por dos motivos: primero, porque demuestra de forma reproducible que un clasificador calibrado muy pequeno puede extraer informacion de procedencia real de un simple float; segundo, porque incorpora un marcador explicito de fuera de distribucion (`?? OOD`) que hace visible cuando la inferencia no es fiable. La licencia es Apache 2.0 y solo se declara soporte para ingles, aunque el modelo no procesa texto libre: su entrada son caracteristicas numericas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP de dos capas en NumPy (entrada -> 32 unidades ocultas -> 3 clases), con temperatura de calibracion ajustada |
| Parametros totales | 387 en la tarea numerica; 515 en la tarea de tokens |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no procesa secuencias de texto; la entrada son caracteristicas numericas) |
| Tipos de cuantizacion | no disponible; los pesos se generan en el arranque en precision de NumPy y no se publican checkpoints cuantizados |
| Idiomas soportados | en (declarado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible; no se distribuyen pesos, el modelo se entrena desde cero al ejecutar el script |

Datos adicionales derivados de la documentacion:

| Parametro | Valor |
|---|---|
| Caracteristicas de entrada | 8 en la tarea numerica y 12 en la de tokens (inferido del recuento de parametros: 32*entrada + 131) |
| Clases de salida | 3 en la tarea numerica; categorias de plantilla en la de tokens |
| Dependencias | solo NumPy (`pip install numpy`) |
| Tokenizador | funcion local `bpe_like` de 12 lineas, sin ficheros externos |
| Entrenamiento | 250 epocas, tamano de lote 64, semillas fijadas |
| Fecha de publicacion | 2026-10-01 segun los metadatos de HuggingFace |

## Arquitectura y entrenamiento
La arquitectura es un MLP deliberadamente minimo: una capa de entrada que proyecta sobre 32 unidades ocultas y una capa de salida de 3 clases. No hay atencion, ni convoluciones, ni mecanismos recurrentes, ni estados internos. El modelo se instancia con `MLP(X_tr.shape[1], 32, 3)` y se entrena con `train_mlp` durante 250 epocas con lotes de 64 ejemplos. Los conjuntos de datos son generados sinteticamente: 2.000 ejemplos de entrenamiento y 400 de test en cada tarea, con semillas fijadas para reproducibilidad. Sobre la salida softmax se ajusta una temperatura (`fit_temperature`) para calibrar las probabilidades.

Las caracteristicas de la tarea numerica excluyen intencionadamente `max_iter` y `tol`, que serian configuracion del solver y no serian observables en el momento de la reconstruccion; incluyen la forma del valor y el tamano de la matriz. La tarea de tokens se resuelve con el denominado truco del residuo: se calcula `bpe_like(text)` (una estimacion gratuita del numero de tokens a partir de clases de caracteres) y se resta del recuento observado, aislando el desplazamiento de plantilla como entero exacto (`0`, `+7` o `+11`). No se menciona uso de RLHF, DPO ni ningun tipo de ajuste por preferencias humanas.

## Capacidades
- Inferencia de procedencia numerica: a partir de un valor (por ejemplo `5.9971`) y un `n` (por ejemplo 20), emite etiquetas del tipo `[unconverged_short p=0.99]`, `[unconverged_short? p=0.75]` o `[unconverged_short?? OOD p=0.63]`.
- Inferencia de procedencia de tokens: a partir de un recuento y el texto de origen, identifica la plantilla o tokenizador (por ejemplo `[bpe+chatml p=1.00]`).
- Confianza calibrada: las probabilidades se ajustan con temperatura, de modo que `p=0.75` pretende corresponder a una precision real del 75%.
- Deteccion de fuera de distribucion: las entradas fuera del rango de entrenamiento reciben el marcador `?? OOD`, senalando que la probabilidad no es interpretable.
- Serializacion con marcadores: distingue entre procedencia inferida de alta confianza, inferida de baja confianza y OOD, de modo que un consumidor pueda aceptar solo procedencia observada.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles; solo se declara ingles y la entrada no es texto libre.

## Casos de uso
- Auditoria de pipelines numericos: cuando un solver devuelve un float y el estado de convergencia se ha perdido en el serializado, el modelo permite inferir si el resultado provino de una ejecucion convergida o no, anadiendo una etiqueta de procedencia al valor antes de almacenarlo en un registro.
- Monitorizacion de APIs de calculo: un servicio que solo expone el numero puede envolverse con esta herramienta para anadir a la respuesta una etiqueta de procedencia inferida, de modo que los consumidores tengan contexto sobre la fiabilidad del valor.
- Auditoria de facturacion de tokens: dado un recuento observado y el texto, el modelo identifica la plantilla o el esquema de tokenizacion que lo genero, lo que permite verificar si el coste facturado corresponde al esperado.
- Guardarrail de admision en cascada: un sistema downstream puede exigir procedencia observada (de `numerical_provenance.py` o `token_provenance.py`) y rechazar automaticamente la procedencia inferida o marcada como OOD, gracias a la distincion explicita entre `p=`, `?` y `??`.
- Deteccion temprana de deriva de datos: el marcador `?? OOD` actua como filtro barato para detectar entradas que se salen del rango de entrenamiento antes de que lleguen a modelos mayores, sin coste de GPU.
- Comprobacion ligera en CI/CD: al depender solo de NumPy y entrenarse en segundos en CPU, el modelo puede ejecutarse como prueba de cordura en un pipeline de integracion continua para verificar que los valores que produce el sistema mantienen la procedencia esperada.
- Docencia sobre calibracion y OOD: el propio autor documenta que la tarea de tokens se resuelve con una busqueda de umbral y una temperatura saturada (0,50), lo que lo convierte en un ejemplo didactico de calibracion enganosa.
- Depuracion forense de resultados cientificos: reconstruir retroactivamente si un valor almacenado provino de una ejecucion sin convergencia, cuando ya no se dispone de los metadatos originales.

## Benchmarks y rendimiento

Tarea numerica:

| Metrica | Valor |
|---|---|
| Parametros | 387 |
| Ejemplos de entrenamiento | 2000 |
| Ejemplos de test | 400 |
| Baseline por mayoria | 54,9 % |
| Precision en test | 77,5 % |
| Error de calibracion esperado (ECE) | 0,021 |
| Temperatura ajustada | 0,99 |

Tarea de tokens:

| Metrica | Valor |
|---|---|
| Parametros | 515 |
| Ejemplos de entrenamiento | 2000 |
| Ejemplos de test | 400 |
| Precision en test | 100,0 % |
| Error de calibracion esperado (ECE) | 0,000 |
| Temperatura ajustada | 0,50 |

Autotest: 19 de 19 comprobaciones superadas. Entre ellas, que no haya fuga de caracteristicas (precision inferior a 0,85), que la tarea numerica supere el azar (precision superior a 0,40), que la tarea de tokens sea casi perfecta (precision superior a 0,95) y que la serializacion emita `??` en casos OOD. El propio autor advierte de que la confusion en la tarea numerica se concentra entre las dos clases `unconverged`: separar `converged` de `unconverged` es mas facil, mientras que distinguir `short` de `long` es practicamente imposible a partir del valor aislado. En la tarea de tokens, reconoce que el resultado del 100 % es trivial y que la temperatura saturada en el limite inferior de la rejilla indica un softmax saturado, por lo que `p=1.00` no debe considerarse mas informativo que `p=0.77` en la tarea numerica.

## Requisitos de hardware
- VRAM: no aplica. El modelo no requiere GPU; se ejecuta integramente en CPU.
- GPU recomendadas: no se requiere ninguna GPU (A100, H100 o RTX 4090 no aportan ninguna ventaja para este modelo).
- Cabe en cualquier equipo consumer: cualquier maquina capaz de ejecutar Python con NumPy, incluyendo portatiles basicos y entornos sin acelerador.
- Opciones de despliegue: ejecucion directa del script `provenance_reconstruct.py`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, y en la practica no aplican, ya que no es un modelo de pesos distribuidos ni un transformer.
- Instalacion: `pip install numpy`. Sin descargas de pesos, sin ficheros de tokenizador, sin acceso a ningun hub de modelos.
- Latencia y throughput: no disponibles en la informacion proporcionada. El entrenamiento se describe como "en segundos", pero no se publican cifras de latencia ni de caudal de inferencia.
- Memoria: el modelo tiene menos de 600 parametros y el conjunto de entrenamiento 2.000 ejemplos, por lo que su huella de memoria es trivial en cualquier entorno moderno.

## Comparativa con modelos similares

| Herramienta | Parametros | Entrada | Salida | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| provenance-reconstruct | 387 / 515 | Caracteristicas numericas | Etiqueta de procedencia con confianza | Inferencia desde el lado del consumidor | apache-2.0 | HuggingFace |
| numerical-provenance.py (misma serie) | no disponible | Ejecucion del solver | Procedencia observada | Registro en el lado del productor | no disponible | Referenciada en la model card |
| token-provenance.py (misma serie) | no disponible | Tokenizacion real | Procedencia observada | Registro en el lado del productor | no disponible | Referenciada en la model card |
| Plataformas generales de procedencia (MLflow, DVC, Weights & Biases) | no aplica | Metadatos de experimentos y artefactos | Linaje y trazabilidad | Gestion de experimentos | variadas | Ampliamente disponibles |

No se dispone de modelos comparables de la misma categoria exacta (clasificadores minimos de reconstruccion de procedencia). La comparacion con plataformas de procedencia general es orientativa: estas registran procedencia observada a lo largo de todo el ciclo de vida, mientras que `provenance-reconstruct` reconstruye procedencia perdida a partir de un unico valor aislado. No se han publicado comparaciones directas con alternativas de terceros.

## Limitaciones y advertencias
- No es un oraculo de procedencia: el propio autor senala que una etiqueta `[CONVERGED p=0.99]` puede seguir siendo incorrecta.
- Precision limitada en la tarea numerica: 77,5 % frente a un baseline de mayoria del 54,9 %. La mejora es real pero modesta.
- Confusion estructural: la distincion entre las clases `unconverged_short` y `unconverged_long` es practicamente imposible a partir del valor aislado.
- Confianza saturada en la tarea de tokens: la temperatura ajustada toca el limite inferior de la rejilla (0,50) y el ECE es 0,000, lo que indica saturidad del softmax; el valor de `p` aporta menos informacion de la que aparenta.
- Resultado trivial en tokens: el rendimiento del 100 % proviene de una resta exacta (`count - bpe_like(text)`), no de capacidad de aprendizaje. El autor lo describe como "aritmetica disfrazada de aprendizaje".
- Marcador OOD: cuando la entrada esta fuera de distribucion, la probabilidad emitida no es significativa. Cualquier integracion en produccion debe tratar `?? OOD` como rechazo, no como clasificacion.
- Sin capacidades generativas: no produce texto, no razona, no ejecuta codigo, no procesa imagenes ni audio y no soporta tool calling ni agentes.
- Limitacion idiomatica: solo se declara ingles, y la entrada del modelo no es texto libre, por lo que el multilingue no aplica realmente.
- Reentrenamiento en el arranque: al no distribuirse pesos, cada ejecucion debe reproducir el entrenamiento, lo que introduce dependencia de las semillas y de la version de NumPy para obtener resultados identicos.
- Datos sinteticos: los conjuntos de entrenamiento y test son generados artificialmente, por lo que el rendimiento en datos reales de produccion no esta validado y podria diferir.
- Licencia: Apache 2.0 permite uso comercial y modificacion, con la obligacion habitual de conservar el aviso de licencia y el fichero NOTICE cuando corresponda.
- Adopcion practicamente nula: cero descargas y una sola marca de "me gusta" en el momento de la consulta, sin senales de uso en produccion ni de validacion por terceros.
- Caveat de fecha: los metadatos indican una fecha de publicacion (2026-10-01) que conviene verificar antes de citarla.

## Enlaces
- HuggingFace: https://huggingface.co/zeechimp/provenance_reconstruct
- Top 10 AI Reproducibility & Provenance Tooling: https://aiopsschool.com/blog/top-10-ai-reproducibility-provenance-tooling-features-pros-cons-comparison/
- The Role of Provenance Modeling in Tracing and Reproducing (Springer): https://link.springer.com/chapter/10.1007/978-3-032-22208-4_33
- Data Authenticity, Consent, & Provenance for AI are all broken (arXiv): https://arxiv.org/html/2404.12691v1
- Co-constructing Explanations for AI Systems using Provenance (arXiv): https://arxiv.org/pdf/2507.17761
- AI Model Provenance: What to Record (Smart Logic AI): https://www.smartlogicusa.com/ai-model-provenance-guide
- Repositorio de `numerical-provenance` y `token-provenance` (misma serie): no disponible
- Paper o documentacion tecnica adicional del modelo: no disponible
