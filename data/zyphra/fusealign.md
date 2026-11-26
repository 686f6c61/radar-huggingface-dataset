# Zyphra/fusealign

## Resumen

FuseAlign multilingual es un alineador forzado (forced aligner) a nivel de palabra desarrollado por Zyphra. Dado un audio y su transcripcion, predice el inicio y el fin de cada palabra sobre una rejilla de 1 ms, junto con una probabilidad de presencia. No es un modelo generativo: es una herramienta especializada de alineacion temporal, una tarea fundamental en pipelines de ASR, subtitulado, sintesis de voz y analisis fonetico.

El checkpoint publicado es una reproduccion del metodo FuseAlign (Vaidya et al., 2026) en su variante multilingue "noisy student", entrenada durante 60.000 pasos a partir del fine-tune CJK del modelo multilingue, sobre unas 25.000 horas de audio en 73 idiomas. La arquitectura combina un codificador de texto basado en el encoder de Dia (nari-labs/Dia-1.6B) con un modulo de alineacion, y el paquete incluye pesos en fp32/bf16, con unos 462 millones de parametros totales.

Su relevancia es practica: los alineadores forzados son un componente critico en produccion (subtitulos sincronizados, datasets de TTS, evaluacion de ASR) y este modelo compite directamente con alternativas como Qwen3-ForcedAligner-0.6B, superandola de forma clara en corpus con etiquetas limpias y en audio espontaneo (Buckeye, AMI), aunque no en todos los idiomas de FLEURS. La licencia Apache-2.0 y la disponibilidad de GGUF (incluida una cuantizacion Q8_0 de 0,51 GB) lo hacen desplegable en entornos modestos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Alineador forzado neuronal: encoder de texto (Dia) + modulo de alineacion FuseAlign, prediccion por palabra sobre rejilla de 1 ms |
| Parametros totales | 462.270.850 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F32 (GGUF), Q8_0 (GGUF); safetensors en fp32 con encoder de texto en bf16 |
| Idiomas soportados | 73 idiomas (entrenamiento); evaluacion en mandarin, japones, coreano, espanol, portugues, frances, aleman, ruso e ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PyTorch), GGUF (f32 y q8_0) |

## Arquitectura y entrenamiento

FuseAlign es un alineador forzado a nivel de palabra: recibe una grabacion y su transcripcion y produce, para cada palabra, un inicio, un fin y una probabilidad de presencia (`WordAlignment(word, start, end, presence, placed)`). La prediccion se hace sobre una rejilla temporal de 1 ms. El modelo integra un encoder de texto derivado de Dia (nari-labs/Dia-1.6B-0626) y el modulo de alineacion propiamente dicho, segun la reproduccion del paper de Vaidya et al. (2026).

El entrenamiento sigue el paradigma "noisy student": un modelo profesor por idioma etiqueta audio limpio y el estudiante aprende a partir de audio aumentado. El checkpoint publicado es la variante multilingue, entrenada 60.000 pasos desde el fine-tune CJK del modelo multilingue, sobre aproximadamente 25.000 horas de audio en 73 idiomas. El metodo esta disenado para funcionar "in the wild", es decir, con audio ruidoso y transcripciones imperfectas, algo que se refleja en los resultados sobre corpus espontaneos como Buckeye y AMI.

El repositorio incluye tres artefactos: un paquete PyTorch safetensors (1,34 GB, FuseAlign fp32 y encoder de texto bf16), un GGUF F32 (1,35 GB, con Silero VAD F32) y un GGUF Q8_0 (0,51 GB, con matmuls del transformer en Q8_0 y el resto de tensores de Dia en BF16). El port a ggml permite su uso mediante una CLI en C++.

## Capacidades

- Alineacion forzada a nivel de palabra: inicio y fin de cada palabra con resolucion de 1 ms.
- Probabilidad de presencia por palabra, util para detectar palabras ausentes o mal transcritas.
- Manejo de audio ruidoso y espontaneo (entrenamiento noisy student con audio aumentado).
- Cobertura multilingue amplia: 73 idiomas en entrenamiento, con evaluacion en nueve idiomas.
- Alineacion de formato largo (long-form alignment) segun la documentacion del repositorio.
- Integracion con deteccion de actividad de voz (Silero VAD) en los GGUF.
- API Python via `torch.hub` y CLI en C++/ggml.
- No es un modelo generativo: no transcribe, no traduce ni responde preguntas; requiere la transcripcion como entrada.

## Casos de uso

- Generacion de subtitulos sincronizados: dado un audio y su transcripcion, el modelo produce marcas temporales por palabra que permiten construir subtitulos con resaltado karaoke o sincronizacion fina, gracias a la resolucion de 1 ms.
- Creacion de datasets para TTS: para entrenar sintesis de voz se necesitan pares texto-audio con limites de palabra precisos; FuseAlign los genera a partir de grabaciones y transcripciones existentes, con soporte para 73 idiomas.
- Evaluacion de sistemas ASR: al comparar la salida del ASR con la referencia temporal, las marcas por palabra permiten medir errores de temporizacion y detectar palabras omitidas mediante la probabilidad de presencia.
- Analisis fonetico y linguistico: investigadores pueden extraer duraciones de palabra y patrones temporales en corpus espontaneos (tipo Buckeye o Seoul) para estudios de habla natural.
- Doblaje y postproduccion de audio: la alineacion por palabra facilita el ajuste de locuciones dobladas a la duracion del original y la sustitucion de segmentos de audio con precision.
- Anotacion semiautomatica de corpus: el modelo actua como preanotador de limites de palabra en corpus multilingues, reduciendo el trabajo manual de revision; su licencia Apache-2.0 permite uso comercial.
- Busqueda y navegacion en archivos de audio: las marcas temporales habilitan indexacion por palabra en podcasts, entrevistas o archivos de reuniones (evaluado en AMI).

## Benchmarks y rendimiento

Metrica: porcentaje de limites de palabra con error superior a 50 ms (error asimetrico del paper). Comparacion con Qwen3-ForcedAligner-0.6B (qwen-asr 0.0.6, bf16, clips completos) sobre los mismos clips, transcripciones y referencias. FuseAlign evaluado con el paquete PyTorch en CUDA, un clip por forward.

| Corpus | FuseAlign | Qwen3-FA |
|---|---:|---:|
| TIMIT | 7,92 | 20,17 |
| Buckeye | 7,23 | 24,60 |
| AMI-silver | 34,22 | 58,22 |
| TIMIT-long | 8,21 | 20,04 |
| BZNSYP Mandarin (gold) | 15,44 | 28,04 |
| Seoul Corpus Korean (gold) | 22,43 | 33,58 |
| FLEURS Mandarin | 17,97 | 11,06 |
| FLEURS Japanese | 13,34 | 8,38 |
| FLEURS Korean | 7,80 | 11,53 |
| FLEURS Spanish | 15,43 | 11,71 |
| FLEURS Portuguese | 9,20 | 10,24 |
| FLEURS French | 13,34 | 12,35 |
| FLEURS German | 13,99 | 13,91 |
| FLEURS Russian | 10,60 | 11,18 |

Nota: las referencias de FLEURS son salida de Montreal Forced Aligner, no etiquetas manuales; las de BZNSYP y Seoul Corpus son manuales (Seoul: turnos de entrevistado de 40 hablantes, maximo 30 s).

## Requisitos de hardware

- VRAM estimada para inferencia: el paquete PyTorch ocupa 1,34 GB en disco (FuseAlign fp32 + encoder bf16), por lo que cabe comodamente en GPUs con 4-8 GB de VRAM. El GGUF Q8_0 de 0,51 GB reduce aun mas el requisito.
- GPU recomendadas: cualquier GPU CUDA moderna; el ejemplo oficial usa `device="cuda"`. Para cargas grandes, A100/H100 o L4/A10 resultan adecuadas dado el tamano reducido del modelo.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, e incluso en CPU mediante el port ggml.
- Opciones de despliegue: PyTorch via `torch.hub` (`fusealign_hub`), CLI en C++/ggml con GGUF (F32 o Q8_0). No se documentan integraciones con vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada. La evaluacion se realizo con un clip por forward en CUDA.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Error >50 ms (TIMIT) | Error >50 ms (Buckeye) |
|---|---|---:|---|---|---:|---:|
| FuseAlign multilingual (este) | 462 M | 73 | Apache-2.0 | safetensors, GGUF | 7,92 | 7,23 |
| Qwen3-ForcedAligner-0.6B | 0,6 B (aprox.) | no disponible | no disponible | no disponible | 20,17 | 24,60 |
| Montreal Forced Aligner | no disponible | no disponible | no disponible | no disponible | no disponible (usado como referencia en FLEURS) | no disponible |

FuseAlign supera a Qwen3-ForcedAligner-0.6B en los corpus con etiquetas limpias o espontaneos (TIMIT, Buckeye, AMI, BZNSYP, Seoul) y queda por detras en varios idiomas de FLEURS (mandarin, japones, espanol), donde las referencias son salida de MFA y no etiquetas manuales. No se dispone de datos de otros alineadores comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Requiere la transcripcion como entrada: no transcribe audio; errores en la transcripcion degradan la alineacion.
- Rendimiento desigual por idioma: en FLEURS queda por detras de Qwen3-FA en mandarin, japones y espanol, y muy cerca en portugues, frances, aleman y ruso.
- Error elevado en audio de reunion espontanea: AMI-silver muestra un 34,22 % de limites con error superior a 50 ms, el peor resultado de la tabla.
- Las referencias de FLEURS no son etiquetas manuales, sino salida de Montreal Forced Aligner, lo que limita la interpretacion de esas cifras.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero la probabilidad de presencia y las marcas pueden ser poco fiables en audio muy ruidoso o con solapamiento de hablantes.
- Sesgos: no se documentan sesgos especificos; el entrenamiento noisy student con profesores por idioma puede heredar los sesgos de esos profesores.
- Licencia Apache-2.0 permite uso comercial; los pesos incluyen el encoder de texto de Dia (Apache-2.0) y los GGUF incluyen Silero VAD (MIT), compatible con uso comercial.
- No se documentan integraciones con servidores de inferencia estandar (vLLM, TGI), lo que puede complicar el despliegue a gran escala.
- Longitud de contexto no documentada: para audio muy largo conviene segmentar con VAD (incluido en los GGUF).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zyphra/fusealign
- Codigo, uso, alineacion de formato largo y CLI C++/ggml: https://github.com/Zyphra/fusealign-multilingual
- Paper: https://arxiv.org/abs/2609.33650 (Vaidya et al., 2026, "FuseAlign: Forced Alignment in the Wild")
- Modelo comparable evaluado: https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B
- Encoder de texto Dia: https://huggingface.co/nari-labs/Dia-1.6B-0626
- Silero VAD: https://github.com/snakers4/silero-vad
