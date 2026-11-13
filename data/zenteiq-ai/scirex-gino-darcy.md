# zenteiq-ai/scirex-gino-darcy

## Resumen

ScireX GINO · Darcy flow 2D es un operador neuronal (neural operator) entrenado para resolver el benchmark de flujo de Darcy bidimensional en su variante data-driven. Lo desarrolla el proyecto zenteiq-ai sobre la libreria de codigo abierto ScireX, escrita en JAX/Flax, y los pesos publicados corresponden a la ultima epoca del entrenamiento documentado en la model card. No es un modelo de lenguaje: es un surrogate fisico que aprende el mapa entre un campo de permeabilidad y el campo de presion asociado sobre una malla de 85x85 puntos.

El modelo implementa la arquitectura GINO (Geometry-Informed Neural Operator), publicada por Li et al. en NeurIPS 2023 (arXiv:2309.00583). Con 2.801.340 parametros reales (2.109.420 segun el recuento de safetensors, que cuenta los pesos complejos de forma distinta), esta pensado para sustituir total o parcialmente un solver numerico de EDPs en tareas de simulacion repetitiva, donde el coste de una evaluacion del operador es orders de magnitud menor que el de un solver clasico.

Su relevancia es la de un checkpoint de referencia reproducible: el autor publica la receta de entrenamiento completa, las estadisticas de normalizacion en `config.json`, un fichero `sample.safetensors` con entrada y salida esperada para verificar la instalacion, y el comando exacto de inferencia contra el tag `v1.0.0` del repositorio. El resultado reportado es un error relativo L2 de test del 1,603 %.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GINO (Geometry-Informed Neural Operator), implementada en JAX/Flax |
| Parametros totales | 2.109.420 (recuento safetensors); 2.801.340 parametros reales segun la model card (pesos complejos contados como dos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de 85x85 = 7.225 puntos de malla |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo numerico, no linguistico) |
| Licencia | Apache 2.0 para los pesos; codigo bajo LGPL-3.0; datos de entrenamiento CC BY 4.0 |
| Formato de pesos | safetensors (`model.safetensors`), mas `config.json` con ajustes y estadisticas de normalizacion, y `sample.safetensors` de verificacion |

## Arquitectura y entrenamiento

GINO combina un backbone espectral tipo FNO con un procesador de atencion sobre una representacion geometrica, lo que le permite operar sobre mallas y geometrias irregulares manteniendo el sesgo inductivo de los operadores integrales. En este checkpoint el modelo aprende un mapa punto a punto entre el campo de permeabilidad de entrada y el campo de presion de salida, ambos definidos sobre una rejilla regular de 85x85 (7.225 puntos).

El entrenamiento se realizo con AdamW adaptado a pesos complejos, un scheduler coseno one-cycle con pico de 1e-3, weight decay de 1e-4 y recorte de norma de gradiente de 1.0. La funcion de perdida es L2 relativa mas 0.1 veces una regularizacion de gradiente, con normalizacion por pixel. Se usaron lotes de 16 durante 2.000 epocas (124.000 pasos), semilla 0, con un tiempo total de aproximadamente 89 minutos. El conjunto de datos es el de flujo de Darcy de Li et al. (ICLR 2021), registro Zenodo 12784353, con 1.000 muestras de entrenamiento y 200 de test. Las estadisticas de normalizacion viven en `config.json` y son imprescindibles: los pesos no son utilizables sin ellas.

## Capacidades

- Prediccion del campo de presion a partir de un campo de permeabilidad en malla 2D de 85x85, en una sola pasada forward.
- Evaluacion determinista y reproducible: misma entrada, misma salida, sin muestreo estocastico.
- Inferencia sobre CPU o GPU via JAX; el modelo es lo bastante pequeno (2,8 M parametros reales) para ejecutarse en entornos sin acelerador dedicado.
- Verificacion de integridad mediante `sample.safetensors`, que incluye una entrada de test y la salida esperada.
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni capacidades multilingues: es un surrogate de EDP, no un modelo generativo de proposito general.
- Extensible a otras fisicas mediante los demas checkpoints de la familia ScireX (Navier-Stokes 2D, pipe flow, chip cooling, AirfRANS, Car-CFD, ShapeNetCar).

## Casos de uso

- Simulacion de yacimientos y medios porosos: dado un campo de permeabilidad estimado por geostadistica o por datos de sondeo, el operador devuelve el campo de presion en milisegundos, lo que permite barridos de incertidumbre con miles de realizaciones donde un solver de elementos finitos tardaria horas.
- Diseno inverso y optimizacion de forma: integrado en un bucle de optimizacion, el modelo actua como funcion objetivo diferencial y barata de evaluar, lo que hace viable explorar miles de configuraciones de permeabilidad en lugar de decenas.
- Generacion de datasets sinteticos: el bajo coste por evaluacion permite producir pares entrada-salida para entrenar otros modelos o para aumentar la cobertura de un conjunto de validacion.
- Prototipado de pipelines de IA cientifica: sirve como referencia funcional para validar infraestructura JAX/Flax, normalizacion y formato safetensors antes de escalar a operadores mayores.
- Docencia e investigacion en operadores neuronales: el checkpoint, la receta de entrenamiento y el script de inferencia reproducen el benchmark de Darcy de extremo a extremo en menos de 90 minutos de entrenamiento, lo que lo hace util como baseline docente.
- Validacion cruzada de solvers: comparar la salida del operador con un solver clasico sobre el mismo campo de permeabilidad es una forma rapida de detectar errores en la discretizacion o en las condiciones de contorno del solver.

## Benchmarks y rendimiento

| Metrica | Este modelo | Referencia publicada |
|---|---|---|
| L2 relativo de test (epoca final) | 1,603 % | no disponible |

No se han publicado resultados de benchmarks adicionales en la informacion disponible. La model card no incluye comparativas numericas contra los otros checkpoints de la familia (FNO, Transolver, WNO) en esta pagina; esas cifras viven en la tabla comparativa del repositorio de GitHub.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB con pesos en precision nativa; el modelo tiene 2,8 M parametros reales, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquiera con soporte JAX/CUDA; una RTX 3060 o superior es mas que suficiente. En A100 o H100 el cuello de botella sera el lanzamiento de kernels, no la memoria.
- Cabe en GPU consumer: si, en practicamente todas, incluidas integradas si se usa CPU.
- Opciones de despliegue: JAX/Flax nativo con el script `scripts/benchmarks/darcy/infer.py` del repositorio ScireX. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dado el tamano, se espera una latencia de milisegundos por muestra en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / malla | L2 relativo test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ScireX GINO (este) | 2,8 M reales | 85x85 | 1,603 % | Apache 2.0 | Hugging Face + GitHub |
| ScireX FNO | no disponible | 85x85 | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| ScireX Transolver | no disponible | 85x85 | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| ScireX WNO | no disponible | 85x85 | no disponible en esta ficha | Apache 2.0 | Hugging Face |

Los cuatro checkpoints resuelven el mismo benchmark de Darcy con la misma particion de datos, por lo que la comparativa directa es posible consultando la tabla comparativa del repositorio. Los valores numericos de los competidores no figuran en la informacion proporcionada y no se reproducen aqui.

## Limitaciones y advertencias

- Valido unicamente dentro del rango de entrada del benchmark de entrenamiento; extrapolar a permeabilidades o regimenes fuera de distribucion no esta garantizado.
- No apto para diseno de seguridad critica sin validacion independiente, tal como advierte el propio autor.
- Los pesos son inutilizables sin las estadisticas de normalizacion de `config.json`; cargarlos sin ellas produce salidas incorrectas sin error visible.
- El modelo esta entrenado sobre una malla fija de 85x85; no hay soporte documentado para resoluciones distintas ni para geometrias irregulares en este checkpoint concreto.
- Riesgo de alucinacion en el sentido de predicciones fisicamente plausibles pero erroneas fuera del dominio de entrenamiento; no hay mecanismo de calibracion de incertidumbre incluido.
- La licencia Apache 2.0 cubre los pesos, pero el codigo de ScireX es LGPL-3.0 y los datos de entrenamiento son CC BY 4.0: hay que respetar las tres condiciones en un uso comercial o derivado.
- El recuento de parametros difiere entre la model card (2.801.340 reales) y los safetensors (2.109.420); conviene tenerlo en cuenta al reportar cifras.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zenteiq-ai/scirex-gino-darcy
- Repositorio ScireX: https://github.com/zenteiq-research/scirex
- Tabla comparativa del benchmark Darcy: https://github.com/zenteiq-research/scirex/blob/v1.0.0/doc/benchmarks/darcy/results/comparative.md
- Guia de reproducibilidad: https://github.com/zenteiq-research/scirex/blob/v1.0.0/doc/benchmarks/reproducibility.md
- Issues del proyecto: https://github.com/zenteiq-research/scirex/issues
- Paper de GINO (Li et al., NeurIPS 2023): https://arxiv.org/abs/2309.00583
- Dataset de Darcy flow (Li et al., ICLR 2021), Zenodo: https://zenodo.org/records/12784353
- Checkpoints hermanos: https://huggingface.co/zenteiq-ai/scirex-fno-darcy, https://huggingface.co/zenteiq-ai/scirex-transolver-darcy, https://huggingface.co/zenteiq-ai/scirex-wno-darcy
- Variante physics-only: https://huggingface.co/zenteiq-ai/scirex-gino-darcy-physics-extra-fields
- Otros benchmarks del mismo modelo: https://huggingface.co/zenteiq-ai/scirex-gino-pipe, https://huggingface.co/zenteiq-ai/scirex-gino-navier-stokes, https://huggingface.co/zenteiq-ai/scirex-gino-chip-cooling, https://huggingface.co/zenteiq-ai/scirex-gino-airfrans, https://huggingface.co/zenteiq-ai/scirex-gino-shapenetcar, https://huggingface.co/zenteiq-ai/scirex-gino-car-cfd
