# tphakala/BSG-BAT

## Resumen

BSG-BAT es una red neuronal convolucional (CNN) disenada para identificar 21 especies de murcielagos europeos a partir de grabaciones de audio ultrasonico. El modelo original fue desarrollado por el equipo BSG-BAT (publicado en Zenodo con DOI 10.5281/zenodo.15495676) y esta version concreta es una conversion a formato ONNX realizada por tphakala, el autor del proyecto BirdNET-Go, para su uso en pipelines de inferencia basados en ONNX Runtime.

A diferencia de otros clasificadores de murcielagos basados en embeddings (que suelen reutilizar un backbone tipo BirdNET y reinterpretar la tasa de muestreo), BSG-BAT es una CNN end-to-end independiente que trabaja directamente sobre espectrogramas log-mel de audio ultrasonico real a 384 kHz. El modelo cubre la banda de 9 a 150 kHz, lo que le permite analizar las frecuencias reales de ecolocalizacion sin trucos de "ralentizacion".

La relevancia actual radica en su orientacion a produccion: se distribuye como seis checkpoints ONNX independientes pensados para funcionar en ensemble, con un tamano de aproximadamente 83 MB por checkpoint (FP32), lo que facilita su despliegue en dispositivos de borde como una Raspberry Pi dentro de sistemas de monitorizacion de fauna en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (6x Conv2d + max-pool, 3x capas fully connected) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana deslizante de 512 frames (~1.024 s), hop de 250 frames (0.5 s) |
| Tipos de cuantizacion | FP32 (los checkpoints distribuidos); no se documentan otras cuantizaciones |
| Idiomas soportados | no aplica (clasificacion de audio); metadatos indican en |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (FP32, ~83 MB por checkpoint, 6 checkpoints) |

## Arquitectura y entrenamiento

BSG-BAT es una CNN supervisada que recibe como entrada un espectrograma log-mel de forma `[batch, 1, 512, 128]` (1 canal, 512 frames temporales, 128 bins mel) y produce logits `[batch, 22]` correspondientes a 21 especies de murcielago mas una clase `Background`. La salida se activa con sigmoid por clase, lo que configura un problema multi-etiqueta entrenado con BCEWithLogits. El backbone consta de seis bloques Conv2d con max-pooling seguidos de tres capas fully connected.

El preprocesado es estricto y forma parte del contrato del modelo: audio mono a 384 kHz, espectrograma mel con `n_fft=1024`, `hop_length=768`, `n_mels=128`, `fmin=9000` y `fmax=150000`, seguido de normalizacion por segmento (media/desviacion tipica), resta de la mediana por bin y recorte al rango 0-6. El modelo se distribuye como seis checkpoints entrenados de forma independiente (`r1` a `r6`), pensados para combinarse en ensemble mediante min, max, media o mediana de los logits o probabilidades. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en clasificacion de audio).

La conversion a ONNX se realizo con el exportador dynamo de PyTorch (opset 18), con eje de batch dinamico y pesos embebidos en un unico fichero autocontenido. La verificacion numerica reporta una diferencia absoluta maxima inferior a 3e-6 entre PyTorch y ONNX Runtime para cada checkpoint sobre entrada aleatoria.

## Capacidades

- Clasificacion multi-etiqueta de 21 especies de murcielagos europeos mas una clase `Background`.
- Procesamiento de audio ultrasonico real en la banda de 9 a 150 kHz a 384 kHz de muestreo.
- Inferencia por ventana deslizante con solapamiento (ventanas de ~1.024 s, hop de 0.5 s), lo que permite detectar especies en grabaciones largas.
- Funcionamiento en ensemble de seis checkpoints para mejorar robustez, o con un unico checkpoint de forma autonoma.
- Salida de logits por segmento que permite aplicar umbrales especificos por especie.
- Ejecucion via ONNX Runtime con soporte de CPU (y potencialmente otros execution providers de ONNX Runtime).
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un clasificador de audio.

## Casos de uso

- Monitorizacion de fauna en tiempo real: integrado en BirdNET-Go, el modelo analiza flujos de audio de estaciones de campo para detectar y clasificar especies de murcielagos de forma continua, aprovechando su bajo coste computacional y su despliegue en Raspberry Pi.
- Estudios de biodiversidad y evaluacion de impacto ambiental: procesamiento por lotes de grabaciones nocturnas de larga duracion para generar inventarios de especies presentes en una zona, usando la ventana deslizante para localizar eventos de ecolocalizacion.
- Vigilancia de parques eolicos: deteccion de actividad de murcielagos cerca de aerogeneradores para correlacionar con condiciones meteorologicas y reducir mortalidad mediante paradas selectivas.
- Gestion forestal y agricola: seguimiento de poblaciones de murcielagos insectivoros como indicadores de salud del ecosistema y como control biologico de plagas.
- Investigacion acustica comparada: uso de los logits por segmento y de umbrales especificos por especie para analisis finos de comportamiento de ecolocalizacion (frecuencias, patrones de llamada).
- Despliegue en nodos de borde sin GPU: al ejecutarse con ONNX Runtime en CPU y con checkpoints de ~83 MB, puede correr en dispositivos de bajo consumo en ubicaciones remotas sin conectividad.
- Validacion y curaduria de datasets bioacusticos: preetiquetado automatico de grabaciones para revision humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; los checkpoints son FP32 de ~83 MB cada uno, por lo que el modelo es muy ligero en memoria (del orden de cientos de MB incluyendo activaciones y los seis checkpoints en ensemble).
- GPU recomendadas: no se especifican; el modelo esta disenado para ejecutarse en CPU.
- Compatibilidad con GPU de consumo: previsiblemente si en cualquier GPU moderna, dado el reducido tamano, aunque no se documenta.
- Despliegue: ONNX Runtime (CPUExecutionProvider documentado); integrable en BirdNET-Go. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Especies | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BSG-BAT (esta version) | CNN end-to-end, ONNX | 21 + Background | Espectrograma log-mel de audio a 384 kHz (9-150 kHz) | CC-BY-4.0 | Hugging Face (tphakala/BSG-BAT) |
| BSG-BAT original (v0.21) | CNN end-to-end, PyTorch | 21 + Background | Igual que la version ONNX | CC-BY-4.0 | Zenodo (DOI 10.5281/zenodo.15495676) |
| Clasificadores basados en embeddings tipo BirdNET | Backbone de embeddings + clasificador | Variable | Audio reinterpretado | Variable | Variable |

No se dispone de informacion sobre otros modelos comparables especificos de clasificacion de murcielagos en la informacion proporcionada.

## Limitaciones y advertencias

- Requiere audio a 384 kHz mono en formato sin perdida (WAV/FLAC); los codecs con perdida (AAC, MP3, Opus) descartan el contenido ultrasonico y hacen el modelo inutilizable.
- Si se remuestrea audio de menor tasa a 384 kHz, el contenido por encima del Nyquist original estara ausente, lo que degrada la deteccion.
- El preprocesado debe reproducirse exactamente como en `original_code/data384.py`; desviaciones en `n_fft`, `hop_length`, `n_mels`, `fmin`, `fmax` o en la normalizacion invalidan las predicciones.
- Cobertura geografica limitada a 21 especies de murcielagos europeos; especies fuera de ese conjunto no se clasificaran correctamente.
- Riesgo de falsos positivos y confusiones entre especies acusticamente similares (por ejemplo, dentro de los generos Myotis o Pipistrellus); se recomienda usar el ensemble y umbrales por especie.
- El umbral por defecto de 0.5 (logit > 0) es generico; para produccion conviene calibrar umbrales especificos por especie.
- La licencia CC-BY-4.0 permite uso comercial pero exige atribucion al equipo BSG-BAT y al autor de la conversion.
- No se documentan sesgos especificos ni datos de entrenamiento, lo que limita la evaluacion de robustez ante condiciones acusticas no vistas (ruido antropogenico, grabaciones de baja calidad).
- El modelo es exclusivamente un clasificador: no genera texto, no razona y no soporta agentes ni tool calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tphakala/BSG-BAT
- Modelo original BSG-BAT v0.21 (Zenodo): https://doi.org/10.5281/zenodo.15495676
- Repositorio BirdNET-Go: https://github.com/tphakala/birdnet-go
