# weihang44/video-dit-rubik-stage-a-ar-k4

## Resumen

Este repositorio publica un archivo de checkpoints de investigacion de tres modelos Video DiT (diffusion transformer) de aproximadamente 95 millones de parametros cada uno, entrenados para generar videos de un cubo de Rubik 2x2 con camara fija y tres caras visibles. El desarrollador, weihang44, los presenta como "Stage A, autoregressive k=4": el modelo predice cinco fragmentos de cuatro frames latentes futuros de forma autoregresiva, condicionado por un frame inicial, un prompt de lenguaje de nueve acciones e historial visual. El objetivo declarado es estudiar scaling laws en generacion de video de dominio restringido, no crear un generador de video general.

La arquitectura usa 3D RoPE, cabezas de dimension 64, SwiGLU, 16 canales latentes y parches latentes de (1,2,2). Se ofrecen tres formas: deep-narrow (512 de ancho, 22 capas, 8 cabezas), balanced (640, 14, 10) y wide-shallow (768, 10, 12). El repositorio contiene 24 archivos de checkpoint: siete hitos de entrenamiento por forma y un checkpoint de recuperacion completa por forma. Los backbones congelados (VAE Wan2.1 y features de ModernBERT de 768 dimensiones), el corpus de entrenamiento y el codigo de inferencia/entrenamiento no estan incluidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Video DiT autoregresivo con rectified flow (AR k=4) |
| Parametros totales | Deep-narrow: 95,033,360; Balanced: 94,200,336; Wide-shallow: 96,909,328 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de texto; condiciona sobre frame inicial, prompt de nueve acciones e historial visual) |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch nativo, sin cuantizacion publicada) |
| Idiomas soportados | en (etiqueta "en" en Hugging Face; el modelo no es un LLM general) |
| Licencia | no disponible (el release no especifica concesion de licencia) |
| Formato de pesos | PyTorch .pt (checkpoints nativos, no safetensors) |

## Arquitectura y entrenamiento

Los tres modelos son diffusion transformers con rectified flow y arquitectura autoregresiva. Todos comparten 3D RoPE, dimension de cabeza 64, SwiGLU, 16 canales latentes y parches latentes de (1,2,2). Se diferencian en la relacion profundidad-anchura: deep-narrow (512 de ancho, 22 capas, 8 cabezas, FFN 1408), balanced (640, 14, 10, 1728) y wide-shallow (768, 10, 12, 2048). El modelo condiciona sobre un frame inicial, el prompt de nueve acciones y el historial visual. No se habilita condicionamiento por estado vectorial ni loss de estado auxiliar.

El entrenamiento usa el mismo conjunto de 1M de videos distintos en el mismo orden, con semilla 20260727 y batch global 16. Cada run se ejecuto en una H200 y realizo 62,500 actualizaciones de optimizador. Cada video aporta 5,120 tokens de parches futuros, lo que da 5.12B tokens en el hito final. AR k=4 predice cinco fragmentos de cuatro frames latentes futuros. El entrenamiento usa losses de fragmentos en paralelo con teacher forcing, promediadas antes de una actualizacion; la inferencia usa historial generado. El optimizador es AdamW (betas 0.9, 0.95; epsilon 1e-8; weight decay 0.05; grad clipping 1.0). El learning rate sube en warmup de 16,384 videos hasta 4e-4 y decae por coseno hasta 4e-5 a 1M. Los tiempos de flujo siguen sigmoid(N(0,1)) y el decay de EMA es 0.9999. Las representaciones congeladas son los latentes del VAE Wan2.1 y las features de ModernBERT de 768 dimensiones.

## Capacidades

- Generacion de video de cubo de Rubik 2x2 con camara fija y tres caras visibles, condicionado por frame inicial, prompt de nueve acciones e historial visual.
- Generacion autoregresiva con prediccion de cinco fragmentos de cuatro frames latentes futuros (AR k=4), con teacher forcing en entrenamiento e historial generado en inferencia.
- Tres configuraciones de forma (deep-narrow, balanced, wide-shallow) para estudiar el impacto de profundidad vs anchura en diffusion transformers de video.
- Checkpoints de entrenamiento en siete hitos de exposicion de videos (de 32,768 a 1M de videos), lo que permite analizar la dinamica del entrenamiento a lo largo del tiempo.
- Checkpoints de recuperacion completa que incluyen estado del optimizador y estados RNG para reanudar el entrenamiento.
- No soporta tool calling, function calling ni agentes; no es un modelo de lenguaje general.
- Capacidades multilingues limitadas: solo prompt en ingles, y el modelo no es un LLM.
- Sin vision general ni audio; unicamente generacion de video en el dominio restringido del cubo de Rubik.

## Casos de uso

- Investigacion en scaling laws de diffusion transformers para video: las tres formas con el mismo presupuesto de datos y tokens permiten comparar como la profundidad frente a la anchura afecta al rendimiento en un dominio controlado.
- Analisis de dinamica de entrenamiento: los siete checkpoints de hito por forma permiten trazar la evolucion de las metricas y del estado EMA a lo largo de 1M de videos.
- Estudio de representaciones latentes de video: se puede investigar como el VAE de Wan2.1 y las features de ModernBERT se combinan dentro de un DiT para un dominio de video muy especifico.
- Evaluacion de precision de generacion de video: el entorno del cubo de Rubik proporciona metricas objetivas (precision de pegatinas, exact-frame) para medir la correccion de la generacion de video.
- Reanudacion de entrenamiento experimental: los checkpoints de recuperacion completa permiten continuar el entrenamiento con configuraciones alternativas o datos adicionales, siempre que se restablezcan los activos de dataset y representaciones.
- Comparacion de estrategias de muestreo: los rollouts de desarrollo incluidos permiten evaluar el efecto del numero de pasos de muestreo o del uso de historial generado frente a teacher forcing.

## Benchmarks y rendimiento

No se han publicado benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) porque no es un modelo de lenguaje. El unico dato de rendimiento disponible son los rollouts de desarrollo a 1M de videos, sobre 100 episodios held-out con la misma semilla y ruido de muestreo, 16 pasos de muestreo midpoint por fragmento e historial visual generado. Las medias promedian los nueve limites post-accion, excluyendo el frame inicial. Un frame exacto requiere que las 12 pegatinas visibles sean correctas.

| Forma | Precision media de pegatinas | Precision media de frame exacto | Precision de pegatinas en accion 9 |
|---|---:|---:|---:|
| Deep-narrow | 22.22% | 1.56% | 15.83% |
| Balanced | 21.69% | 0.78% | 16.17% |
| Wide-shallow | 69.74% | 28.44% | 34.17% |

Estos son resultados de una sola semilla, con datos coincidentes, no con FLOPs coincidentes, y no demuestran convergencia. La ventaja de wide-shallow se concentra en horizontes cortos; su precision de frame exacto es cero para las acciones 6-9 en esta evaluacion. El autor advierte explicitamente de que el release no debe interpretarse como un modelo de video de proposito general ni como un solucionador fiable de cubo de Rubik.

## Requisitos de hardware

- VRAM estimada: no disponible. Los pesos del modelo suman aproximadamente 95M de parametros, lo que ocupa unos 380 MB en float32, pero los backbones congelados (VAE Wan2.1 y ModernBERT) no estan incluidos y su consumo de VRAM no se especifica.
- GPU recomendadas: el entrenamiento se realizo con una NVIDIA H200 por run. No se han publicado requisitos de inferencia.
- Si cabe en consumer GPU: no disponible; depende de los backbones congelados no incluidos y de la implementacion de inferencia.
- Opciones de despliegue: no disponible. No es un pipeline de Transformers/Diffusers. Solo se puede cargar con PyTorch mediante el codigo de investigacion coincidente. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos directamente comparables en la misma categoria (generacion de video de cubo de Rubik 2x2 de tres caras con AR k=4). El repositorio es un archivo de checkpoints de investigacion de dominio restringido, no un modelo de video general, por lo que no se puede comparar con modelos de generacion de video como los basados en DiT generales.

## Limitaciones y advertencias

- No es un modelo de video de proposito general: solo genera videos de cubo de Rubik 2x2 con camara fija y tres caras visibles.
- No es un solucionador fiable de cubo de Rubik: la precision de frame exacto es baja (0.78%–28.44% segun la forma) en el rollout de desarrollo.
- La ventaja de wide-shallow se concentra en horizontes cortos; para las acciones 6-9, la precision de frame exacto es cero en la evaluacion.
- Los resultados son de una sola semilla y con datos coincidentes; no son resultados de prueba final ni con multiples semillas.
- Los backbones congelados (VAE Wan2.1, ModernBERT), el corpus de entrenamiento y el codigo de inferencia/entrenamiento no estan incluidos; el repositorio no es directamente reproducible sin esos activos.
- No se especifica licencia: no hay concesion de licencia para el release de checkpoints, por lo que no se puede asumir uso comercial.
- Los archivos de recuperacion completa requieren `weights_only=False` en PyTorch, lo que implica riesgo de ejecucion de codigo arbitrario al deserializar. Solo deben cargarse desde fuentes confiables.
- No es compatible con herramientas estandar como Transformers/Diffusers; requiere el codigo de investigacion coincidente exacto.
- El modelo tiene solo ~95M de parametros y un dominio extremadamente limitado; no es comparable a modelos de video generales.

## Enlaces

- Hugging Face: https://huggingface.co/weihang44/video-dit-rubik-stage-a-ar-k4
- No se han encontrado papers, blogs, repositorios adicionales ni demos especificos de este modelo en la busqueda web.
