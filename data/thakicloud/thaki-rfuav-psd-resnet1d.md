# ThakiCloud/Thaki-RFUAV-PSD-ResNet1D

## Resumen

Thaki-RFUAV-PSD-ResNet1D es un modelo de clasificacion de senales de radiofrecuencia (RF) desarrollado por ThakiCloud. Se trata de una red residual 1D (ResNet unidimensional) con aproximadamente 3,3 millones de parametros que recibe como entrada un espectro de potencia de 0,1 segundos (8192 bins, banda de 2,43 GHz ± 10 MHz) y predice cual de 28 enlaces de radio de drones (14 modelos de UAV × {control, telemetria}) esta transmitiendo. Incluye una segunda cabeza que intenta predecir la fase de vuelo (armado, despegue, hover, movimiento, aterrizaje).

El problema que aborda es la deteccion e identificacion de drones mediante analisis espectral, una tarea relevante para aplicaciones de seguridad, monitorizacion del espectro y contra-UAV. El modelo se publica como "research preview" (vista previa de investigacion) con licencia CC BY 4.0 y pesos en formato safetensors.

Es importante destacar que, segun la propia model card, el modelo **no ha superado el umbral pre-registrado de validacion**: en un sitio de grabacion no visto durante el entrenamiento no es significativamente mejor que una regresion logistica baseline (macro-F1 0,483 frente a 0,474). Por tanto, debe tratarse como un punto de partida entrenado, no como un detector validado. No existe resultado de test sellado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet 1D con stem multi-escala (kernels 7/15/31) + 4 etapas residuales, mean+max pooling, dos cabezas lineales |
| Parametros totales | 3.307.569 |
| Parametros activos | no disponible (no es MoE; todos los parametros estan activos) |
| Longitud de contexto | no aplicable (entrada fija: espectro de 8192 bins, 0,1 s) |
| Tipos de cuantizacion | no disponible (solo pesos en precision original) |
| Idiomas soportados | en, ko (documentacion; la entrada del modelo es RF, no texto) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es una CNN 1D residual: un stem multi-escala con kernels de tamano 7, 15 y 31 seguido de 4 etapas residuales, con pooling combinado (mean + max) y dos cabezas lineales de clasificacion (emisor de 28 clases y fase de vuelo de 5 clases). La entrada es una densidad espectral de potencia (PSD) lineal de 8192 bins que abarca 2,42–2,44 GHz (≈2,44 kHz por bin); el modulo aplica `log10(max(psd, 1e-20))` y estandarizacion por bin usando estadisticas del split de entrenamiento almacenadas en `model.safetensors`.

El entrenamiento se realizo con el dataset AI Hub 71954 (datos de senales RF de UAV, subconjunto PSD), unicamente con capturas del sitio 01 (60.480 capturas). La funcion de perdida fue cross-entropy para el emisor mas 0,3 × cross-entropy para la fase de vuelo, con label smoothing de 0,05. Se uso AdamW con learning rate 2e-3, weight decay 0,05, batch de 256, schedule coseno con 1 epoca de calentamiento, 30 epocas y semilla 0; el checkpoint seleccionado corresponde a la epoca 25 segun macro-F1 de emisor en desarrollo. El hardware de entrenamiento fue una GPU Apple M-series (MPS), con unos 5 minutos por epoca. La aumentacion de datos incluyo ganancia de receptor ±3 dB y elevacion del suelo de ruido, aplicadas en potencia lineal antes del logaritmo.

## Capacidades

- Clasificacion de emisores RF: identifica cual de 28 enlaces (14 modelos de UAV × control/telemetria) transmite, a partir de un espectro de 0,1 s.
- Prediccion de fase de vuelo: segunda cabeza que clasifica entre 5 fases (armado, despegue, hover, movimiento, aterrizaje), aunque el propio autor indica que esta cerca del azar y no debe usarse.
- Inferencia local en CPU, CUDA o MPS, con latencia de 2,0 ms p50 en MPS y 4,1 ms p50 en CPU (batch 1).
- Procesamiento por lotes: acepta entradas de forma (8192,) o (N, 8192).
- No soporta tool calling, agentes, ni capacidades de lenguaje: no es un modelo de lenguaje ni multimodal en el sentido habitual.

## Casos de uso

- **Investigacion en identificacion de emisores RF**: punto de partida entrenado para investigar arquitecturas 1D sobre espectros de potencia, con codigo de definicion y de inferencia incluidos y reproducible.
- **Prototipado de deteccion de drones en banda ISM de 2,4 GHz**: base para sistemas de monitorizacion espectral en entornos controlados con el mismo receptor y banda (2,42–2,44 GHz).
- **Benchmark de arquitecturas para clasificacion espectral**: comparacion de ResNet 1D frente a ConvNeXt-1D, regresion logistica o GBM sobre las mismas caracteristicas.
- **Ensenanza y formacion**: ejemplo realista de metodologia rigurosa con validacion pre-registrada, splits por sitio de grabacion y analisis de generalizacion entre sitios.
- **Pipeline de adquisicion y clasificacion en laboratorio**: integracion en scripts Python que capturen PSD de 8192 bins para inferencia en tiempo casi real (latencias de pocos milisegundos).
- **Estudio de transferencia entre sitios de grabacion**: analisis de por que el rendimiento cae de 0,96–0,98 macro-F1 en el sitio de entrenamiento a 0,48 en un sitio nuevo, util para investigar memorizacion de sesion.

## Benchmarks y rendimiento

Resultados en desarrollo (sitio 02, no usado en entrenamiento; 60.480 capturas, 280 sesiones):

| Tarea | Este modelo | Baseline LogReg | Δ (bootstrap por sesion, IC 95%) |
|---|---|---|---|
| Emisor, 28 clases, macro-F1 | 0,4827 | 0,4740 | +0,006 [−0,027, +0,040] — no significativo |
| Emisor, accuracy | 0,5381 | 0,5111 | — |
| Fase de vuelo, 5 clases, macro-F1 | 0,2282 | 0,2169 | +0,011 [−0,023, +0,044] — no significativo |

Datos adicionales publicados:

| Comparacion | Resultado |
|---|---|
| vs. baseline GBM (macro-F1 0,307) | Δ +0,172 [+0,131, +0,211] |
| ConvNeXt-1D (2,8M parametros, mismo recipe) | macro-F1 0,4533 (no seleccionado, no publicado) |
| Capturas retenidas del sitio de entrenamiento | LogReg 0,96 / GBM 0,98 macro-F1 (memorizacion de sesion) |
| Test sitio 03 | No existe: el umbral pre-registrado no se cumplio y el test permanece sellado |

Clases con peor rendimiento: telemetria de uav01 y uav10 con recall 0,00; uav11 telemetria 0,004; uav09 telemetria 0,029. En 10 de 28 clases el recall por clase esta por debajo del baseline LogReg.

Latencia (batch 1): 2,0 ms p50 en Apple M-series (MPS) y 4,1 ms p50 en CPU en la misma maquina.

## Requisitos de hardware

- VRAM estimada para inferencia: minima; con 3,3 millones de parametros, el modelo cabe holgadamente en cualquier GPU moderna (del orden de decenas de MB). No se publica una cifra exacta.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU, CUDA y MPS. El entrenamiento original se hizo en una GPU Apple M-series (MPS).
- Consumer GPU: sobrado; cualquier GPU con soporte PyTorch (incluidas integradas Apple Silicon) es suficiente.
- Despliegue: el modelo se distribuye como modulo PyTorch (`rfuav1d.py`) descargable via `huggingface_hub.snapshot_download`; no hay soporte documentado de vLLM, llama.cpp, Ollama o TGI (no aplica, al no ser un modelo de lenguaje).
- Latencia y throughput: 2,0 ms p50 por captura en MPS y 4,1 ms p50 en CPU con batch 1, segun datos del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Tarea | macro-F1 (dev, sitio nuevo) | Licencia |
|---|---|---|---|---|---|
| Thaki-RFUAV-PSD-ResNet1D | 3,3M | PSD 8192 bins, 2,43 GHz | 28 emisores UAV + fase de vuelo | 0,4827 | CC BY 4.0 |
| ConvNeXt-1D (mismo recipe, no publicado) | 2,8M | PSD 8192 bins, 2,43 GHz | 28 emisores UAV + fase de vuelo | 0,4533 | no disponible |
| Baseline LogReg (mismas caracteristicas) | no disponible | PSD 8192 bins, 2,43 GHz | 28 emisores UAV | 0,4740 | no disponible |
| Baseline GBM (mismas caracteristicas) | no disponible | PSD 8192 bins, 2,43 GHz | 28 emisores UAV | 0,307 | no disponible |

No se conocen otros modelos publicos comparables de clasificacion de enlaces UAV por PSD en Hugging Face con datos de evaluacion equivalentes.

## Limitaciones y advertencias

- **No validado**: en un sitio nuevo no es significativamente mejor que una regresion logistica baseline; el gate pre-registrado para abrir el test no se cumplio y no existe numero de test.
- **Rendimiento por clase muy desigual**: las enlaces de telemetria de varios UAV (uav01, uav09, uav10, uav11) son practicamente indetectables en un sitio nuevo (recall 0,00–0,029); en 10 de 28 clases el recall esta por debajo del baseline.
- **La cabeza de fase de vuelo esta cerca del azar** (macro-F1 0,2282 frente a ~0,2 de azar con 5 clases); no debe usarse.
- **Sin contexto temporal ni rechazo de emisores desconocidos**: procesa un solo frame de 0,1 s; una senal que no sea de UAV siempre se asigna a una de las 28 clases.
- **Distribution estricta**: solo valida para la banda 2,43 GHz ± 10 MHz, 8192 bins y la cadena de receptor original; capturas con otra frecuencia central, ancho, numero de bins o receptor estan fuera de distribucion.
- **Datos de entrenamiento no redistribuibles**: el dataset AI Hub 71954 no esta incluido y debe obtenerse de AI Hub bajo sus terminos.
- **Un solo sitio de entrenamiento**: el bootstrap por sesion no cubre la variacion entre sitios; no evaluado en condiciones adversariales, con jamming o multi-emisor.
- **No es un producto certificado** de deteccion o contra-UAV.
- Licencia CC BY 4.0: permite uso comercial con atribucion; sin restricciones adicionales documentadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ThakiCloud/Thaki-RFUAV-PSD-ResNet1D
- Model card en coreano: https://huggingface.co/ThakiCloud/Thaki-RFUAV-PSD-ResNet1D/blob/main/MODEL_CARD.ko.md
- Dataset de entrenamiento (AI Hub 71954, senales RF de UAV): no disponible enlace directo en la informacion proporcionada; obtener desde AI Hub (https://aihub.or.kr) bajo sus terminos.
