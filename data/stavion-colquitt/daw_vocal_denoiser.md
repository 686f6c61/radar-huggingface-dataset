# Stavion-Colquitt/DAW_Vocal_Denoiser

## Resumen

DAW Vocal Denoiser es un modelo de reduccion de ruido para voz cantada y hablada, disenado especificamente para su uso en estaciones de trabajo de audio digital (DAW) durante la grabacion de tomas vocales. Lo desarrolla Stavion-Colquitt, un autor independiente, y se publica bajo licencia MIT en formato ONNX. Su proposito es eliminar el ruido tipico de un estudio domestico (tono de sala, siseo, zumbido de red electrica y filtracion de auriculares) sin degradar las tomas limpias.

La relevancia tecnica del modelo reside en su diseno causal y de baja latencia: opera a 48 kHz mono con una latencia algoritmica de 10 ms y un coste de CPU de 0,19 ms por bloque de 5 ms en ONNX Runtime sobre CPU de escritorio (factor de tiempo real de 0,038). Con solo 1,25 millones de parametros, es lo bastante ligero para ejecutarse en tiempo real dentro de una DAW sin aceleracion por GPU.

Arquitectonicamente combina una STFT con ventanas asimetricas de analisis y sintesis, una compresion de magnitud, una capa lineal con LayerNorm y una GRU de dos capas de 256 unidades que predice una mascara de magnitud sigmoide, conservando la fase ruidosa original. El modelo se distribuye con pesos ONNX y un checkpoint PyTorch, junto con el codigo del motor de streaming.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | STFT con ventanas asimetricas + Linear + LayerNorm + GRU de 2 capas (256) + mascara de magnitud sigmoide |
| Parametros totales | 1,25 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; procesamiento por tramas de 5 ms con estado GRU |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (procesamiento de audio, independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | ONNX (`daw_denoiser.onnx`) y PyTorch (`daw_denoiser.pth`) |
| Frecuencia de muestreo | 48 kHz mono |
| Latencia algoritmica | 10 ms (ventanas de analisis de 32 ms, sintesis de 10 ms, hop de 5 ms) |
| Tamano de bloque de streaming | 240 muestras (5 ms) |
| Coste de CPU | 0,19 ms por bloque de 5 ms (ONNX Runtime, CPU de escritorio) |
| Factor de tiempo real | 0,038 |
| Paridad streaming/offline | 111,9 dB |

## Arquitectura y entrenamiento

El modelo emplea ventanas asimetricas de analisis y sintesis (Wang et al. 2021), que permiten obtener la resolucion frecuencial de una ventana larga (bins de 31 Hz, suficiente para los armonicos graves del canto) manteniendo la latencia de una ventana corta. Cada trama de 5 ms pasa por una compresion de magnitud, una capa lineal, LayerNorm y una GRU de dos capas con 256 unidades ocultas, que produce una mascara de magnitud sigmoide aplicada al espectrograma. La fase ruidosa original se conserva, lo que evita artefactos de reconstruccion de fase.

El entrenamiento se realizo durante 108.773 pasos (batch de 32, segmentos de 4 s) en una RTX 4060, con el mejor checkpoint de validacion en el paso 77.000 y una perdida de desarrollo de 0,338. Se uso perdida espectral comprimida (Braun y Tashev) combinada con STFT multirresolucion, optimizador AdamW con warmup y decaimiento coseno, y EMA de 0,999. Los datos de entrenamiento incluyen tomas vocales propias del autor (divididas por cancion), el corpus VocalSet (CC BY 4.0, dividido por cantante), voz limpia y ruido del DNS Challenge de Microsoft, y filtracion de auriculares simulada generada a partir de instrumentales propios con salas sinteticas, ecualizacion aleatoria, siseo y zumbido de 50/60 Hz. No se emplearon packs de muestras comerciales.

## Capacidades

- Reduccion de ruido en tiempo real de voz cantada y hablada grabada en salas sin tratamiento acustico.
- Eliminacion de tono de sala, siseo, zumbido de red electrica (50/60 Hz) y filtracion de auriculares.
- Procesamiento causal con estado recurrente, apto para streaming continuo dentro de una DAW.
- Modo offline mediante `process_file` para procesar una senal completa de 48 kHz mono.
- Preservacion de tomas limpias: SI-SDR de paso directo de 45,6 dB en material limpio.
- No elimina reverberacion: las salas se aplicaron por igual a entrada y objetivo, de modo que la reverb permanece.
- No soporta tool calling, agentes, vision, audio de entrada distinto de voz ni capacidades multilingues en el sentido de texto.

## Casos de uso

- Grabacion vocal en home studio: el modelo se inserta como plugin en la cadena de entrada de la DAW y limpia en tiempo real el ruido de fondo de la sala, con 10 ms de latencia que permiten monitorizar sin retardo perceptible.
- Limpieza de tomas ya grabadas: mediante `process_file` se procesa una pista completa de 48 kHz mono antes de mezclar, eliminando siseo y zumbido sin afectar a las tomas limpias.
- Produccion musical de voz cantada: al conservar la fase original y operar con bins de 31 Hz, preserva los armonicos graves del canto, adecuado para voces masculinas y femeninas en registro bajo.
- Podcasting y locucion: elimina el ruido de sala y el zumbido de equipos en grabaciones de voz hablada, con un coste de CPU que permite ejecutarlo en portatiles sin GPU.
- Integracion en pipelines de audio automatizados: el ONNX ligero (1,25 M de parametros) puede embeberse en servicios de procesamiento por lotes o en herramientas de linea de comandos para normalizar la calidad de grandes catalogos de grabaciones.
- Prototipado de plugins: al incluir `model.py` y `stream.py`, sirve como base para desarrollar plugins de DAW (VST/AU) con un motor de streaming ya resuelto.
- Monitorizacion en directo: el factor de tiempo real de 0,038 permite procesar la senal de microfono en vivo en un equipo modesto, aunque el modelo no esta disenado para PA ni escenarios de alta amplificacion.

## Benchmarks y rendimiento

Evaluacion sobre 200 items de canto no visto en entrenamiento ni en seleccion de modelo (una cancion propia y cantantes de VocalSet), mezclados con ruido del split de desarrollo a 0-40 dB SNR y ejecutados a traves del motor de streaming.

| Metrica | Entrada ruidosa | Mejorada | Cambio |
|---|---|---|---|
| SI-SDR (dB) | 19,04 | 22,95 | +3,91 |
| PESQ (WB, a 16 kHz) | 2,37 | 3,05 | +0,68 |
| SI-SDR de paso directo en material limpio (dB) | no disponible | 45,6 | no disponible |

| Propiedad de tiempo real | Valor |
|---|---|
| Frecuencia de muestreo | 48 kHz mono |
| Latencia algoritmica | 10 ms (ventanas de 32 ms / 10 ms, hop de 5 ms) |
| CPU por bloque de 5 ms (ONNX Runtime, CPU de escritorio) | 0,19 ms (factor de tiempo real 0,038) |
| Paridad streaming vs offline | 111,9 dB |

No se han publicado resultados comparativos con otros modelos de reduccion de ruido en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo esta pensado para ejecutarse en CPU. Con 1,25 M de parametros, el uso de memoria es minimo (del orden de decenas de MB incluyendo el runtime).
- GPU recomendadas: no se especifican; el autor entreno en una RTX 4060, pero la inferencia se valida en CPU de escritorio con ONNX Runtime.
- Cabe en cualquier GPU de consumo e incluso en CPU: el coste medido es de 0,19 ms por bloque de 5 ms en CPU de escritorio.
- Opciones de despliegue: ONNX Runtime (validado por el autor), con el motor `stream.py` para streaming y `process_file` para modo offline. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: latencia algoritmica de 10 ms; factor de tiempo real de 0,038 en CPU, lo que deja margen sobrado para ejecucion en tiempo real.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada. Como referencia cualitativa, el modelo se situa en la categoria de reductores de ruido ligeros y causales para audio, donde habitualmente se comparan alternativas como RNNoise, DeepFilterNet o los modelos del DNS Challenge; sin embargo, no se han publicado en la informacion disponible mediciones frente a ellos.

| Modelo | Parametros | Contexto/latencia | Licencia | Formato |
|---|---|---|---|---|
| DAW Vocal Denoiser | 1,25 M | 10 ms de latencia algoritmica | MIT | ONNX, PyTorch |
| RNNoise | no disponible | no disponible | no disponible | no disponible |
| DeepFilterNet | no disponible | no disponible | no disponible | no disponible |
| Modelos del DNS Challenge | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No elimina reverberacion: la reverb de la sala permanece en la salida, ya que las salas se aplicaron igual a entrada y objetivo durante el entrenamiento.
- No probado con material muy distorsionado ni con SNR extremadamente bajo (por debajo de 0 dB); la filtracion de auriculares muy fuerte puede sobrevivir al procesado.
- Disenado exclusivamente para mono a 48 kHz; es necesario remuestrear otras frecuencias antes de usarlo.
- No se han documentado sesgos especificos ni evaluaciones de robustez fuera de los dominios de entrenamiento (canto y voz hablada de estudio).
- Riesgo de alucinacion no aplica en el sentido de generacion de texto, pero si existe riesgo de artefactos o sobre-suavizado en pasajes con ruido atipico no representado en el corpus.
- El modelo se entreno con datos propios del autor y corpus publicos (VocalSet, DNS Challenge); no se detalla la cobertura de acentos, idiomas ni estilos vocales mas alla de lo indicado.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias ni soporte; el checkpoint PyTorch y el ONNX se distribuyen sin validacion externa independiente.
- El repositorio de Hugging Face tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Stavion-Colquitt/DAW_Vocal_Denoiser
- GitHub (codigo, receta de entrenamiento y write-up): https://github.com/Stavion-Colquitt/Daw-Vocal-Denoiser
- VocalSet (Wilkins et al., ISMIR 2018): no disponible en la informacion proporcionada
- DNS Challenge (Microsoft): no disponible en la informacion proporcionada
- Referencia de ventanas asimetricas (Wang et al. 2021): no disponible en la informacion proporcionada
