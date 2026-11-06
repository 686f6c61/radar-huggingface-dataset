# SzczurekLab/ImmuVis_Conv

## Resumen

ImmuVis Conv es un modelo fundacional de autoencoder enmascarado (masked autoencoder) para imagen de citometria de masas (imaging mass cytometry, IMC), desarrollado por SzczurekLab. La IMC es una tecnologia de imagen multiplexada de alto rendimiento en la que cada marcador molecular se representa como un canal de imagen, lo que permite perfilar tejidos espacialmente a gran escala. El problema central que aborda es que los paneles de marcadores varian entre estudios, de modo que el espacio de canales no es fijo como en las imagenes naturales; ImmuVis resuelve esta limitacion mediante un diseno agnostico al marcador.

El modelo se basa en una arquitectura ConvNeXt v2 con hiperkernels condicionados por marcador, un encoder pan-marcador y un decoder tambien condicionado por marcador. Soporta 265 marcadores definidos por el tokenizador `markers_tokenizer.yaml` y produce una representacion latente de anchura 768. El decoder emite logits de media y log-varianza por marcador solicitado, lo que habilita tareas de staining virtual con estimacion de incertidumbre.

Su relevancia actual radica en que permite analisis de proteomica espacial a gran escala entre paneles heterogeneos y comparaciones retrospectivas entre estudios, algo que los modelos de vision convencionales no pueden hacer al asumir un numero fijo de canales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt v2 con hiperkernels condicionados por marcador (masked autoencoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de imagen cientifica) |
| Licencia | MIT |
| Formato de pesos | pesos PyTorch cargados via `from_pretrained` (repo de 0.5 GB) |

## Arquitectura y entrenamiento

El modelo implementa `multiplex_model.modules.MultiplexAutoencoder` y sigue el paradigma de masked autoencoder aplicado a imagenes multiplexadas. La innovacion principal es el caracter agnostico al marcador: en lugar de asumir un conjunto fijo de canales, el modelo emplea hiperkernels condicionados por la identidad del marcador, junto con un encoder pan-marcador y un decoder condicionado. Esto permite procesar paneles de marcadores distintos sin reentrenar la red.

El decoder genera, para cada marcador solicitado, logits de media y log-varianza, lo que proporciona una salida probabilistica con incertidumbre explicita. El espacio latente tiene anchura 768. El modelo cubre 265 marcadores definidos en el tokenizador compartido entre las variantes de la familia ImmuVis. Los detalles sobre volumen de datos de entrenamiento, composicion del dataset y uso de tecnicas de alineacion no estan disponibles en la informacion proporcionada.

## Capacidades

- Reconstruccion y representacion de imagenes multiplexadas de citometria de masas con paneles de marcadores variables.
- Encoding agnostico al marcador, lo que permite aplicar el modelo a estudios con conjuntos de marcadores distintos.
- Staining virtual: generacion de la senal de un marcador no medido a partir de los medidos, con salida de media y log-varianza.
- Estimacion de incertidumbre por marcador mediante la cabeza de log-varianza del decoder.
- Extraccion de representaciones latentes de anchura 768 para tareas posteriores de analisis espacial.
- Soporte de 265 marcadores mediante tokenizador dedicado.
- No soporta tool calling, agentes ni capacidades linguisticas; no es un modelo de texto.

## Casos de uso

- Staining virtual retrospectivo: dado un panel de marcadores medido, generar la senal de marcadores ausentes para comparar muestras de estudios que usaron paneles distintos, gracias al diseno agnostico al marcador.
- Armonizacion entre estudios: procesar conjuntos de datos de IMC con paneles heterogeneos bajo una misma representacion latente para analisis espacial conjunto.
- Analisis de proteomica espacial a gran escala: extraer representaciones de 768 dimensiones de imagenes multiplexadas para clasificacion de regiones tisulares o clustering de celulas.
- Priorizacion de marcadores en nuevos experimentos: usar la incertidumbre de la salida para identificar que marcadores adicionales aportarian mas informacion en un panel reducido.
- Control de calidad y reconstruccion: emplear el autoencoder enmascarado para detectar senales anomalas o ruidosas comparando la reconstruccion con la medicion original.
- Investigacion en biologia del cancer y tejidos: perfilar espacialmente muestras tumorales multiplexadas y reutilizar el modelo preentrenado como base para tareas downstream con fine-tuning ligero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio de pesos ocupa 0.5 GB, lo que sugiere un modelo de escala moderada, pero no se especifica el numero de parametros.
- GPU recomendadas: no disponible. Al ser un modelo PyTorch de vision, se espera que funcione en GPUs con soporte CUDA, pero no hay datos publicados.
- Cabe en GPU consumer: probablemente si, dado el tamano del repositorio, pero no confirmado en la informacion disponible.
- Opciones de despliegue: carga mediante la libreria `immuvis` y `MultiplexAutoencoder.from_pretrained`; requiere clonar el repositorio `szczurek-lab/ImmuVis` e instalar con `uv sync --python 3.12`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto/canales | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ImmuVis Conv | ConvNeXt v2 MAE para IMC | no disponible | 265 marcadores, latente 768 | MIT | Hugging Face + GitHub |
| Otras variantes ImmuVis | Familia ImmuVis (arquitecturas alternativas) | no disponible | Tokenizador compartido de 265 marcadores | MIT (presumible) | Repositorio del proyecto |
| Modelos de vision convencionales (p. ej. ViT/ConvNeXt estandar) | Vision transformer/CNN | variable | Canales fijos (RGB) | variable | Amplia |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado en imagen de citometria de masas; no es aplicable a texto, codigo ni tareas linguisticas.
- Requiere usar exactamente el mapeo del tokenizador incluido con los pesos; renumerar los IDs de marcador provoca resultados incorrectos.
- Depende de la libreria `immuvis` y de Python 3.12 o superior, lo que anade friccion de integracion.
- No se documentan sesgos especificos, pero al entrenar sobre datos biomedicos puede heredar sesgos de los paneles y cohortes de entrenamiento.
- La incertidumbre de la salida (log-varianza) debe interpretarse con cautela en marcadores poco representados en el entrenamiento.
- No hay informacion publicada sobre robustez frente a ruido, artefactos de adquisicion o paneles muy reducidos.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones del repositorio de codigo asociado.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, por lo que la validacion por parte de la comunidad es practicamente inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/SzczurekLab/ImmuVis_Conv
- Repositorio de codigo: https://github.com/szczurek-lab/ImmuVis
- Paper (arXiv): https://arxiv.org/abs/2602.04585
- Paper (HTML): https://arxiv.org/html/2602.04585v1
