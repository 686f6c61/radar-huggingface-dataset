# wesleiwpa/dettato-transcriber-onnx

## Resumen

`dettato-transcriber-onnx` es una exportación a ONNX de la etapa de transcripción del modelo dettato de KobiMusic, desarrollada por el usuario wesleiwpa. Se trata de una red de carriles equivariante en altura (pitch-equivariant lane network) de 15,3 millones de parámetros que convierte audio mono a 16 kHz en probabilidades de onset, frame y offset para las 88 teclas del piano, con dos voces por tecla. Su función es la transcripción automática de audio a MIDI (audio-to-MIDI) para piano.

La aportación técnica clave frente a una exportación convencional es que las tres capas GRU bidireccionales se han desenrollado en operaciones básicas de matmul, sigmoid y tanh. El operador `GRU` de ONNX no dispone de kernel en WebGPU, lo que obliga a ONNX Runtime Web a fragmentar el grafo entre CPU y GPU en cada GRU y a copiar un mapa de características de aproximadamente 64 MB en cada dirección. Con el grafo desenrollado, toda la inferencia se ejecuta en un único dispositivo.

El modelo es relevante para desarrolladores que necesiten transcripción de piano directamente en el navegador o en GPU de consumo, sin depender de Python ni de PyTorch en tiempo de ejecución. La licencia Apache-2.0 y el tamaño reducido del repositorio (0,1 GB) facilitan su integración en aplicaciones web y herramientas de escritorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red de carriles equivariante en altura con 3 capas GRU bidireccionales desenrolladas en ONNX |
| Parámetros totales | 15,3 M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana fija de 8 s de audio (entrada `(1, 9, 800, 288)`), ventanas cada 2 s |
| Tipos de cuantización | no disponible (pesos float32 en el export) |
| Idiomas soportados | no aplica (modelo de audio, no de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model-gru.onnx`) más ficheros binarios auxiliares (`fb.bin`, `fb_x0.bin`, `win.bin`, `win_x0.bin`) y `frontend.json` |

## Arquitectura y entrenamiento

El modelo es la etapa de transcripción de dettato: una red neuronal que procesa un tensor de características armónicas logarítmicas en frecuencia (HCQT) de forma `(1, 9, 800, 288)` y produce logits de forma `(1, 6, 400, 88)`. Los seis canales de salida corresponden a onset, frame y offset para dos voces por tecla. La arquitectura emplea tres capas GRU bidireccionales que, en esta exportación, se han desenrollado manualmente en operaciones matmul, sigmoid y tanh para eliminar el operador `GRU` nativo de ONNX.

El front end no forma parte del grafo ONNX: se implementa por separado y requiere STFT con `n_fft` 2048 y 512, hop 160, un banco de filtros triangular (`fb.bin`), logaritmo, desplazamientos armónicos de canal y las ventanas de Hann correspondientes. La verificación del autor indica que las GRU desenrolladas coinciden con el kernel GRU de ONNX Runtime con un error de 6e-6, y que sobre una canción de referencia completa las notas decodificadas son idénticas al modelo original en PyTorch (670/670). No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; la model card remite a la documentación del modelo base para esos detalles.

## Capacidades

- Transcripción de audio a MIDI para piano: genera onset, duración, altura y confianza para las 88 teclas.
- Polifonía de dos voces por tecla, lo que permite separar hasta dos notas simultáneas en la misma altura.
- Procesamiento de audio mono a 16 kHz con ventanas de 8 s y solapamiento de 2 s.
- Ejecución en CPU y en WebGPU mediante onnxruntime-web ≥ 1.31 (`executionProviders: ['webgpu']`).
- Compatibilidad con el backend WASM de onnxruntime-web (versión 1.23 verificada como correcta).
- No incluye detección de instrumentos ni de batería: esas tareas corresponden a otras tres etapas del pipeline dettato.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Transcripción de piano en el navegador: una aplicación web puede capturar audio del micrófono, trocearlo en ventanas de 8 s con solapamiento de 2 s, ejecutar el ONNX con WebGPU y generar un MIDI descargable sin backend ni instalación de Python.
- Herramientas de práctica musical: transcripción en tiempo casi real de lo que toca el usuario para comparar con una partitura de referencia y señalar notas erróneas, aprovechando la salida de confianza por nota.
- Digitalización de grabaciones históricas de piano: procesamiento por lotes en CPU con onnxruntime para convertir archivos de audio en MIDI editable, útil en archivos musicales y musicología computacional.
- Edición y corrección de partituras: integración en editores de notación que permitan importar audio y obtener una pista MIDI inicial que el usuario refine manualmente, gracias a la salida de onset, offset y frame por separado.
- Aplicaciones de escritorio ligeras: al ocupar 0,1 GB y ejecutarse en CPU, puede embeberse en herramientas de escritorio o plugins de DAW sin requisitos de GPU dedicada.
- Investigación en transcripción automática de música: el export sirve como referencia reproducible del modelo base para comparar variantes de front end, umbrales de decodificación o estrategias de ventaneo sin depender de PyTorch.
- Educación musical asistida: análisis automático de interpretaciones para generar retroalimentación sobre precisión rítmica y de altura, usando las probabilidades de frame y offset para medir duraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta dos verificaciones de equivalencia numérica:

| Verificación | Resultado |
|---|---|
| Coincidencia de GRU desenrolladas con el kernel GRU de ONNX Runtime | error de 6e-6 |
| Notas decodificadas frente al modelo PyTorch en una canción de referencia | 670/670 idénticas |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el modelo tiene 15,3 M de parámetros en float32, lo que supone del orden de 60 MB de pesos, más el mapa de características intermedio de aproximadamente 64 MB citado en la model card.
- GPU recomendadas: cualquier GPU compatible con WebGPU para ejecución en navegador; el autor no especifica modelos concretos.
- GPU de consumo: el modelo está diseñado para ejecutarse en CPU y en WebGPU, por lo que cabe en GPU integradas y en tarjetas de consumo sin requisitos especiales.
- Opciones de despliegue: onnxruntime-web ≥ 1.31 con `executionProviders: ['webgpu']`; backend WASM con onnxruntime-web 1.23; ONNX Runtime nativo en CPU para escritorio o servidor.
- Latencia y throughput: no disponibles. La entrada es estática (una ventana de 8 s por ejecución), y para audio más largo debe ventanearse y promediarse con solapamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| dettato-transcriber-onnx (este) | 15,3 M | ventana de 8 s, audio 16 kHz | ONNX | Apache-2.0 | Etapa de transcripción sola, GRU desenrolladas para WebGPU |
| kobimusic/dettato (base) | 15,3 M (etapa de transcripción) | ventana de 8 s, audio 16 kHz | PyTorch | Apache-2.0 | Pipeline de referencia completo con tres etapas adicionales |
| Alternativas de transcripción audio-to-MIDI | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Solo cubre la etapa de transcripción: no genera pistas de instrumentos ni batería, que corresponden a otras tres etapas del pipeline dettato no incluidas.
- Formas estáticas: cada ejecución procesa exactamente una ventana de 8 s; el audio más largo debe trocearse y promediarse con solapamiento, lo que traslada al integrador la responsabilidad del ventaneo y la decodificación.
- El front end (STFT, banco de filtros, desplazamientos armónicos) no está incluido en el grafo ONNX y debe implementarse por separado a partir de los ficheros auxiliares y `frontend.json`.
- Los umbrales de decodificación (`on_th` 0,25, voz 2 0,30, `off_th` 0,3, `fr_th` 0,4) son valores por defecto y pueden requerir ajuste según el material musical.
- Ejecución en WebGPU requiere onnxruntime-web ≥ 1.31; con versiones anteriores debe usarse el backend WASM, con el coste de rendimiento correspondiente.
- No se dispone de información sobre sesgos, tasas de alucinación ni limitaciones idiomáticas, al no ser un modelo de lenguaje.
- La licencia Apache-2.0 permite uso comercial, pero los ficheros `LICENSE` y `NOTICE` deben acompañar cualquier redistribución.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente del export.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wesleiwpa/dettato-transcriber-onnx
- Modelo base: https://huggingface.co/kobimusic/dettato
- Repositorio del pipeline de referencia: https://github.com/kobimusic/dettato
- Organización KobiMusic en Hugging Face: https://huggingface.co/kobimusic
