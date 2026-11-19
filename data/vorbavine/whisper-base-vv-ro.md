# VorbaVine/whisper-base-vv-ro

## Resumen

whisper-base-vv-ro es un ajuste fino del modelo de reconocimiento automatico del habla (ASR) `openai/whisper-base` de OpenAI, especializado en rumano. Lo publica el usuario VorbaVine en Hugging Face bajo licencia Apache-2.0. El modelo resuelve el problema de la baja precision del Whisper original en rumano: el modelo base obtiene tasas de error de palabra (WER) superiores al 50 % en todos los conjuntos de prueba reportados, mientras que este ajuste las reduce a un rango de 11,76 % a 21,13 %.

Arquitectonicamente es un transformer encoder-decoder de tipo Whisper, con 72.593.920 parametros totales segun los pesos en safetensors, y hereda la ventana de audio de aproximadamente 30 segundos del modelo base. El repositorio ocupa 0,3 GB y el checkpoint retenido es el paso final (22.680 de 22.680) del entrenamiento.

Su relevancia es practica: demuestra que un ajuste fino con datos mixtos (reales y sinteticos) sobre un modelo pequeno de 72 M de parametros puede multiplicar por cuatro o cinco la precision en un idioma concreto, manteniendo un coste de inferencia muy bajo y una licencia permisiva para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 72.593.920 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | audio de hasta aproximadamente 30 s (ventana nativa de Whisper) |
| Tipos de cuantizacion | no disponible (el autor solo documenta inferencia en float16) |
| Idiomas soportados | rumano (ro) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-base`, un transformer encoder-decoder con atencion completa entrenado originalmente por OpenAI para transcripcion y traduccion multilingue. El ajuste fino conserva la arquitectura intacta y solo actualiza los pesos, por lo que mantiene el tokenizador, el procesador de audio (log-Mel de 80 canales a 16 kHz) y la interfaz de generacion de Whisper.

El entrenamiento uso aproximadamente 144 horas de audio repartidas en 86.920 clips: 121,78 h de entrenamiento, 10,91 h de validacion y 11,08 h de prueba. Por procedencia, la composicion es 8,4 h de grabaciones propias, 21,5 h de Common Voice, 5,9 h de FLEURS, 34,4 h de otro habla real y 73,5 h de habla sintetica, es decir, mas de la mitad del corpus es sintetico. Los hiperparametros documentados son tasa de aprendizaje 1e-5 con decaimiento lineal, 227 pasos de warmup, batch efectivo de 64, precision bf16 y weight decay de 0,01. No se documenta el uso de RLHF ni de DPO, algo esperable en un modelo ASR.

Una advertencia metodologica importante: el autor indica que el mismo split fijo (el conjunto VorbaVine) se uso para entrenamiento, seleccion de modelo y prueba, lo que puede inflar los resultados del conjunto "VorbaVine test" respecto a los conjuntos marcados como no vistos.

## Capacidades

- Transcripcion de voz a texto en rumano con audio mono a 16 kHz.
- Generacion de transcripciones con la tarea `transcribe` y el idioma forzado a `ro`.
- Manejo de clips de hasta aproximadamente 30 segundos; el audio mas largo debe trocearse antes de la transcripcion.
- Inferencia en float16 sobre GPU mediante `transformers` y `librosa`.
- No se documentan capacidades de traduccion, diarizacion, marcas de tiempo por palabra, tool calling ni razonamiento multi-paso.
- No se documentan capacidades multilingues mas alla del rumano.

## Casos de uso

- Transcripcion de reuniones y entrevistas en rumano: el modelo convierte audio de hasta 30 s por fragmento en texto, adecuado para pipelines que trocean grabaciones largas y concatenan resultados; su WER de 11,76 % en el conjunto propio lo hace viable para actas internas.
- Subtitulado de contenido audiovisual rumano: con un WER de 13,72 % en el conjunto Mozilla no visto, sirve para generar subtitulos preliminares que un revisor humano corrige, reduciendo el coste frente a transcripcion manual.
- Asistentes de voz para atencion al cliente en rumano: al ser un modelo de 72 M de parametros, puede desplegarse en GPU de gama baja o incluso CPU para transcripcion en tiempo casi real en centros de llamadas.
- Investigacion en ASR de bajos recursos: el modelo y su receta (datos reales mas sinteticos, tasa de aprendizaje 1e-5, bf16) sirven como referencia reproducible para ajustar Whisper a otros idiomas con corpus limitados.
- Indexacion y busqueda de archivos de audio: transcripcion masiva de podcasts o archivos de radio en rumano para alimentar motores de busqueda de texto completo.
- Prototipado rapido en entornos con recursos limitados: el repositorio de 0,3 GB y la licencia Apache-2.0 permiten integrarlo en productos comerciales sin friccion legal ni infraestructura pesada.
- Evaluacion comparativa de ASR en rumano: sus tablas de WER sobre FLEURS, VoxPopuli y Mozilla permiten usarlo como linea base frente a otros sistemas.

## Benchmarks y rendimiento

Resultados de WER (%) publicados por el autor; menor es mejor. Las referencias se normalizaron (minusculas, sin puntuacion, cedilla a coma inferior, abreviaturas expandidas).

| Conjunto de prueba | openai/whisper-base | whisper-base-vv-ro |
|---|---|---|
| VorbaVine test | 56,00 | 11,76 |
| Mozilla (no visto) | 67,51 | 13,72 |
| FLEURS (no visto) | 53,50 | 21,13 |
| VoxPopuli (no visto) | 52,22 | 14,86 |

WER de validacion durante el entrenamiento en el paso final: 11,81 %. No se han publicado resultados de benchmarks adicionales (por ejemplo, MMLU, HumanEval o GSM8K, que no aplican a un modelo ASR) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en float16, los 72,6 M de parametros ocupan aproximadamente 0,15 GB; con activaciones y buffers de audio, cabe holgadamente en menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con soporte de float16, incluidas RTX 3060, RTX 4090, A100 o H100; el modelo es tan pequeno que la GPU no sera el cuello de botella.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna, y probablemente tambien en CPU para transcripcion por lotes.
- Opciones de despliegue: `transformers` con PyTorch es la via documentada por el autor; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | WER en rumano (referencia) |
|---|---|---|---|---|---|
| whisper-base-vv-ro | 72,6 M | ~30 s | rumano | Apache-2.0 | 11,76 % (VorbaVine), 13,72 % (Mozilla) |
| openai/whisper-base | 72,6 M | ~30 s | multilingue | Apache-2.0 | 56,00 % (VorbaVine), 67,51 % (Mozilla) |
| openai/whisper-small | ~244 M | ~30 s | multilingue | Apache-2.0 | no disponible |
| openai/whisper-large-v3 | ~1.550 M | ~30 s | multilingue | Apache-2.0 | no disponible |

La comparativa se limita a los datos publicados: el autor solo reporta cifras frente a `openai/whisper-base`. No hay resultados de `whisper-small` ni `whisper-large-v3` en rumano dentro de la informacion disponible, por lo que no se pueden establecer comparaciones numericas con ellos.

## Limitaciones y advertencias

- El split de entrenamiento, validacion y prueba es el mismo conjunto VorbaVine, lo que puede sobreestimar el rendimiento en el conjunto "VorbaVine test" respecto a datos realmente externos.
- Mas de la mitad del corpus de entrenamiento (73,5 h de 143,77 h) es habla sintetica; el comportamiento en dominios acusticos no representados (ruido de fondo, acentos regionales, audio telefonico) no esta documentado.
- Ventana de audio limitada a aproximadamente 30 s: el audio mas largo debe trocearse, lo que puede introducir errores en las fronteras de los fragmentos.
- Solo soporta rumano; no se documenta traduccion ni otros idiomas.
- Riesgo de alucinacion tipico de Whisper en segmentos silenciosos o con ruido, no cuantificado en la model card.
- Sesgos de genero, edad o acento no evaluados en la informacion disponible.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion externa.
- No se documentan cuantizaciones (GGUF, int8) ni despliegue en CPU, lo que limita su uso fuera de entornos con GPU y PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VorbaVine/whisper-base-vv-ro
- Modelo base: https://huggingface.co/openai/whisper-base
- Repositorio de Whisper en OpenAI: https://github.com/openai/whisper
- Common Voice (Mozilla): https://commonvoice.mozilla.org/
- FLEURS: https://huggingface.co/datasets/google/fleurs
- VoxPopuli: https://github.com/facebookresearch/voxpopuli
