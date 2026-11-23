# sulabhkatiyar/indic-tiny-tts-telugu

## Resumen

Indic Tiny TTS: Telugu es un modelo de síntesis de voz (text-to-speech) especificamente disenado para el idioma telugu, desarrollado por el usuario sulabhkatiyar dentro de la coleccion "Indic Tiny TTS Models". El modelo convierte texto en escritura telugu en audio inteligible con dos voces disponibles (femenina y masculina), y su principal propuesta de valor es la eficiencia: con tan solo 8,9 millones de parametros en pesos safetensors (22,5 millones segun la model card del autor) es capaz de ejecutarse en CPU sin GPU, alcanzando un factor de tiempo real de 0,026 en un solo hilo de Apple M1 (38 veces mas rapido que tiempo real) y 0,136 en un hilo de CPU x86 (7 veces mas rapido).

El modelo aborda el problema de la accesibilidad de TTS de calidad para idiomas indios minoritarios, donde los modelos existentes suelen requerir GPU o tienen tamanos prohibitivos para despliegue en dispositivo. Segun los benchmarks publicados por el autor, en el conjunto FLORES-200 (100 frases) el modelo obtiene un CER del 1,99 %, superando a modelos como `rhasspy/piper-voices` (2,97 %), `ai4bharat/vits_rasa_13` (3,56 %) y `facebook/mms-tts-tel` (4,59 %), y quedando estadisticamente igualado con `ai4bharat/indic-parler-tts` (937,8 M de parametros) y `github.com/AI4Bharat/Indic-TTS`.

La relevancia actual del modelo radica en su combinacion de licencia permisiva (CC-BY-4.0), formato ONNX para inferencia en dispositivo, y rendimiento competitivo frente a alternativas hasta 100 veces mas grandes. Esta disenado para escenarios de despliegue en movil, edge computing y aplicaciones offline donde el coste computacional y la latencia son criticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS neuronal, detalles no especificados en la informacion proporcionada) |
| Parametros totales | 8.932.745 (safetensors); la model card indica 22,5 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica contexto de texto largo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | telugu (te) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

No se especifica en la informacion proporcionada el tipo concreto de arquitectura neuronal (si es VITS, FastSpeech, o similar). La model card indica que el modelo se entreno con el dataset `sulabhkatiyar/indic-tts-mini-24k`, que contiene las voces femenina y masculina de telugu de AI4Bharat Rasa a 24 kHz, derivado del dataset completo `sulabhkatiyar/indic-tts-multilingual-prepared`. Tambien se menciona el dataset `ai4bharat/Rasa` como fuente. No se detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables tipicamente a TTS).

La innovacion tecnica destacable es la optimizacion extrema del tamano del modelo para inferencia en CPU, con soporte para PyTorch y ONNX Runtime. El modelo incluye dos voces (femenina y masculina) seleccionables mediante el parametro `voice`. No se proporcionan detalles sobre la funcion de perdida, el vocoder utilizado ni la tecnica de alineacion texto-audio.

## Capacidades

- Sintesis de voz a partir de texto en escritura telugu.
- Dos voces seleccionables: femenina (`voice="female"`) y masculina (`voice="male"`).
- Inferencia en CPU sin necesidad de GPU, con soporte para PyTorch y ONNX Runtime.
- Ejecucion en dispositivo (on-device) gracias a su tamano reducido y formato ONNX.
- Generacion de audio a 24 kHz (segun el dataset de entrenamiento).
- No se mencionan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio de entrada ni modo thinking, ya que es un modelo puramente TTS.
- Capacidad multilingue limitada exclusivamente al telugu.

## Casos de uso

- **Lectura de noticias y articulos en telugu**: el modelo puede integrarse en aplicaciones de lectura por voz para convertir articulos de noticias en audio, aprovechando su bajo coste computacional para ejecutarse en servidores modestos o incluso en dispositivos.
- **Accesibilidad para personas con discapacidad visual**: su capacidad de ejecucion en CPU y formato ONNX permite integrarlo en lectores de pantalla y aplicaciones de accesibilidad en dispositivos moviles sin depender de conectividad a la nube.
- **Sistemas de respuesta de voz interactiva (IVR) en telugu**: el modelo puede generar respuestas habladas en call centers automatizados, con la ventaja de que su velocidad (7x tiempo real en CPU x86) permite generar audio en tiempo real durante la conversacion.
- **Aplicaciones educativas offline**: para entornos con conectividad limitada, el modelo puede empaquetarse en aplicaciones educativas que lean contenido en telugu sin conexion, usando ONNX Runtime en el dispositivo.
- **Generacion de audiolibros y contenido bajo demanda**: con una tasa de error de caracteres del 1,99 % en frases de noticias, es adecuado para narrar textos largos en telugu donde la inteligibilidad es prioritaria y el coste de sintesis debe ser minimo.
- **Prototipado rapido y pruebas de concepto**: al ser un modelo pequeno (8,9 M de parametros en safetensors) y con licencia CC-BY-4.0, es ideal para investigadores que necesiten un TTS de telugu para experimentos sin grandes recursos de GPU.
- **Integracion en asistentes de voz embebidos**: su tamano reducido permite incluirlo en dispositivos IoT o sistemas embebidos que necesiten sintesis de voz en telugu sin conexion.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor. CER = character error rate (menor es mejor).

**FLORES-200 (100 frases de noticias):**

| Modelo | Tamano | CER (%) | Resultado frente a este modelo |
|---|---:|---:|---|
| **Este modelo** | 22,5 M | **1,99** | — |
| `ai4bharat/IndicF5` | 350,6 M | 1,29 | El suyo mejor |
| `github.com/AI4Bharat/Indic-TTS` (te.zip) | 65,6 M | 2,00 | Igual |
| `ai4bharat/indic-parler-tts` | 937,8 M | 2,12 | Igual |
| `SYSPIN/vits_Telugu_Female` + `Male` | 29,1 M | 2,39 | Igual |
| `rhasspy/piper-voices` (te_IN-padmavathi, venkatesh) | 15,9 M | 2,97 | El nuestro mejor |
| `ai4bharat/vits_rasa_13` | 31,3 M | 3,56 | El nuestro mejor |
| `facebook/mms-tts-tel` | 29,1 M | 4,59 | El nuestro mejor |

**Frases de test retenidas (300):**

| Modelo | Tamano | CER (%) | Resultado frente a este modelo |
|---|---:|---:|---|
| **Este modelo** | 22,5 M | **4,66** | — |
| `github.com/AI4Bharat/Indic-TTS` (te.zip) | 65,6 M | 5,20 | Igual |
| `rhasspy/piper-voices` | 15,9 M | 6,67 | El nuestro mejor |
| `SYSPIN/vits_Telugu_Female` + `Male` | 29,1 M | 8,82 | El nuestro mejor |
| `facebook/mms-tts-tel` | 29,1 M | 10,02 | El nuestro mejor |
| `ai4bharat/vits_rasa_13` (mismas voces) | 31,3 M | 6,78 | El nuestro mejor |

**Comparacion con modelos grandes (mismas frases retenidas):**

| Modelo | Tamano | CER (%) | Este modelo, mismas frases (%) | Resultado |
|---|---:|---:|---:|---|
| `ai4bharat/IndicF5` | 350,6 M | 2,64 | 4,69 | Igual |
| `ai4bharat/indic-parler-tts` | 937,8 M | 3,15 | 4,69 | El suyo mejor |

**Velocidad:**

| Hardware | Configuracion | Mas rapido que tiempo real | Factor de tiempo real |
|---|---|---:|---:|
| CPU x86 (Intel Xeon @ 2,20 GHz, 4 vCPU) | PyTorch, 1 hilo | 7x | 0,136 |
| Apple M1, CPU | PyTorch, 1 hilo | 38x | 0,026 |
| NVIDIA T4 | PyTorch | 62x | 0,016 |

## Requisitos de hardware

- **VRAM estimada para inferencia**: no requiere GPU; el modelo puede ejecutarse integramente en CPU. Para ejecucion en GPU, el consumo de VRAM es minimo (inferior a 1 GB dado el tamano del modelo de 8,9 M de parametros en safetensors).
- **GPU recomendadas**: NVIDIA T4 es suficiente y alcanza 62x tiempo real. Cualquier GPU consumer moderna (RTX 3060, RTX 4090) puede ejecutarlo sin problemas, aunque no es necesario.
- **Cabe en GPU consumer**: si, en cualquier GPU consumer, e incluso en CPU sin GPU.
- **Opciones de despliegue**: PyTorch, ONNX Runtime. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS). El formato ONNX esta pensado para despliegue en dispositivo.
- **Latencia y throughput**: factor de tiempo real de 0,136 en 1 hilo de CPU x86 (7x mas rapido que tiempo real), 0,026 en Apple M1 (38x), y 0,016 en T4 (62x). En la model card se indica que es ~120x mas rapido que `ai4bharat/indic-parler-tts` en T4 y ~169x mas rapido que `ai4bharat/IndicF5` en T4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER FLORES-200 (%) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| **Indic Tiny TTS: Telugu** | 8,9 M (safetensors) / 22,5 M (model card) | no disponible | 1,99 | CC-BY-4.0 | Hugging Face, ONNX |
| `ai4bharat/IndicF5` | 350,6 M | no disponible | 1,29 | no disponible | Hugging Face |
| `ai4bharat/indic-parler-tts` | 937,8 M | no disponible | 2,12 | no disponible | Hugging Face |
| `rhasspy/piper-voices` (te_IN) | 15,9 M | no disponible | 2,97 | no disponible | Hugging Face, Piper |
| `facebook/mms-tts-tel` | 29,1 M | no disponible | 4,59 | no disponible | Hugging Face |

La ventaja principal de este modelo frente a las alternativas es la combinacion de tamano reducido, velocidad en CPU y licencia CC-BY-4.0 permisiva para uso comercial. `ai4bharat/IndicF5` obtiene mejor CER pero es 16 veces mas grande y presumiblemente mas lento; `indic-parler-tts` es 40 veces mas grande y obtiene un CER ligeramente peor en FLORES-200.

## Limitaciones y advertencias

- **Idioma unico**: el modelo solo soporta telugu; no es multilingue ni puede sintetizar otros idiomas indios.
- **Sesgos**: no se documentan sesgos especificos, pero al entrenarse con las voces de AI4Bharat Rasa, puede heredar las caracteristicas y posibles sesgos de esos hablantes (genero, dialecto, prosodia).
- **Riesgo de alucinacion**: en TTS, el riesgo se manifiesta como pronunciacion incorrecta o distorsion en palabras fuera del dominio de entrenamiento; no se proporcionan datos sobre robustez ante palabras extranas, numeros o siglas.
- **Limitaciones de contexto**: no aplica contexto de texto largo; el modelo procesa frases o fragmentos, no documentos extensos de forma nativa.
- **Licencia**: CC-BY-4.0 permite uso comercial con atribucion, pero es necesario verificar los terminos de los datasets de entrenamiento (AI4Bharat Rasa) para produccion.
- **Caveat de produccion**: el dato de parametros totales en safetensors (8.932.745) no coincide con el indicado en la model card (22,5 M); se recomienda verificar el checkpoint real antes de desplegar. No se especifican los tipos de cuantizacion disponibles ni la arquitectura exacta, lo que limita la reproducibilidad.
- **Calidad en dominios especificos**: los benchmarks se basan en frases de noticias (FLORES-200) y frases retenidas; el rendimiento en dominios como medicina, legal o conversacional no esta documentado.

## Enlaces

- Hugging Face: https://huggingface.co/sulabhkatiyar/indic-tiny-tts-telugu
- Coleccion Indic Tiny TTS Models: https://huggingface.co/collections/sulabhkatiyar/indic-tiny-tts-models-6aeae36f954418631a68676d
- Dataset de entrenamiento: https://huggingface.co/datasets/sulabhkatiyar/indic-tts-mini-24k
- Dataset completo: https://huggingface.co/datasets/sulabhkatiyar/indic-tts-multilingual-prepared
- Dataset AI4Bharat Rasa: https://huggingface.co/datasets/ai4bharat/Rasa
- Benchmark FLORES-200 (imagen): https://huggingface.co/sulabhkatiyar/indic-tiny-tts-telugu/resolve/main/assets/bench_flores.png
- Benchmark frases retenidas (imagen): https://huggingface.co/sulabhkatiyar/indic-tiny-tts-telugu/resolve/main/assets/bench_rasa.png
- Benchmark modelos grandes (imagen): https://huggingface.co/sulabhkatiyar/indic-tiny-tts-telugu/resolve/main/assets/bench_big.png
- Muestra de audio femenina: https://huggingface.co/sulabhkatiyar/indic-tiny-tts-telugu/resolve/main/samples/female_1.wav
- Modelo comparable `ai4bharat/IndicF5`: https://huggingface.co/ai4bharat/IndicF5
- Modelo comparable `ai4bharat/indic-parler-tts`: https://huggingface.co/ai4bharat/indic-parler-tts
- Modelo comparable `rhasspy/piper-voices`: https://huggingface.co/rhasspy/piper-voices
- Modelo comparable `facebook/mms-tts-tel`: https://huggingface.co/facebook/mms-tts-tel
