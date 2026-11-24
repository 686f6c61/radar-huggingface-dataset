# veripazari/whisper-large-v3-turbo-turkish

## Resumen

Whisper Large v3 Turbo Turkish es un ajuste fino (fine-tuning) del modelo de reconocimiento automatico del habla `openai/whisper-large-v3-turbo` especializado en transcripcion de turco. Lo desarrolla originalmente Selim Çavaş (usuario `selimc` en Hugging Face) y esta version concreta la publica y archiva la plataforma VeriPazari bajo el identificador `veripazari/whisper-large-v3-turbo-turkish`, conservando la documentacion y licencia originales.

El modelo parte de la arquitectura encoder-decoder de Whisper en su variante "turbo", con 808.878.080 parametros totales, y se ha entrenado sobre el subconjunto turco del dataset Common Voice 17.0. Segun declara el autor, solo se utilizo el 25 % de los datos turcos disponibles por limitaciones de GPU en Colab, lo que condiciona el rendimiento final alcanzado (WER de 18,92 % en el split de test).

Es relevante porque ofrece una alternativa ligera y de licencia MIT para ASR en turco, un idioma con menos recursos que el ingles en el ecosistema de modelos de voz, y porque su tamano contenido (unos 3,2 GB en el repositorio) permite desplegarlo en infraestructura modesta. No obstante, el WER reportado es alto para produccion, por lo que debe evaluarse con cautela antes de usarlo en entornos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) |
| Parametros totales | 808.878.080 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por chunk en la pipeline de ejemplo) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; admite cuantizacion estandar via transformers/llama.cpp no documentada por el autor) |
| Idiomas soportados | turco (tr) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Whisper large-v3-turbo de OpenAI: un encoder que procesa espectrogramas Mel y un decoder autorregresivo que genera tokens de texto, con atencion estandar (no lineal) y sin innovaciones de decodificacion especulativa declaradas por el autor. La variante "turbo" de Whisper reduce el numero de capas del decoder respecto a large-v3, lo que explica su menor numero de parametros (808,9 M frente a los 1.550 M de large-v3) y su mayor velocidad de inferencia.

El ajuste fino se realizo sobre el subconjunto turco de Common Voice 17.0, utilizando unicamente el 25 % de los datos disponibles segun reconoce el autor por restricciones de GPU en Colab. Los hiperparametros declarados son: learning rate 1e-5, batch de entrenamiento 16, batch de evaluacion 8, semilla 42, optimizador Adam (betas 0.9/0.999, epsilon 1e-8), scheduler lineal con 500 pasos de warmup, 4000 pasos de entrenamiento y precision mixta nativa (AMP). No se menciona uso de RLHF, DPO ni tecnicas de alineacion adicionales; es un ajuste supervisado clasico de ASR.

## Capacidades

- Transcripcion de audio en turco a texto (ASR) con soporte de timestamps por chunk (`return_timestamps=True`).
- Procesamiento por lotes (batch) de audio con `chunk_length_s=30` y `batch_size` configurable en la pipeline de transformers.
- Reconocimiento de voz para comandos vocales en turco, segun los usos previstos declarados por el autor.
- Generacion automatica de subtitulos para videos en turco.
- No se declaran capacidades de traduccion, diarizacion de hablantes, tool calling, agentes ni razonamiento multi-paso.
- No se declaran capacidades multimodales mas alla del audio de entrada.

## Casos de uso

- Transcripcion de reuniones y entrevistas en turco: el modelo convierte audio en texto con marcas temporales, adecuado para actas o busquedas posteriores, aunque el WER del 18,9 % exige revision humana.
- Generacion de subtitulos para videos turcos: la pipeline con `return_timestamps=True` permite alinear segmentos de texto con el audio para plataformas de video.
- Comandos de voz en turco para asistentes o interfaces: el modelo puede clasificar y transcribir ordenes cortas, si bien su entrenamiento generalista (no especifico de comandos) limita la precision en dominios cerrados.
- Archivado y catalogacion de audio historico en turco: util para digitalizar grabaciones y hacerlas buscables, con cuantizacion o ejecucion en GPU de gama media.
- Prototipado rapido de aplicaciones de voz en turco: al tener licencia MIT y pesos safetensors, se integra facilmente en pipelines de transformers para pruebas de concepto.
- Investigacion en ASR de bajos recursos: sirve como punto de partida (baseline) para experimentos de fine-tuning adicional con mas datos turcos, dado que el autor solo uso el 25 % de Common Voice.
- Preprocesamiento de datasets de audio: transcripcion masiva por lotes para anotar corpus turcos antes de otros entrenamientos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Dataset | Split | Metrica | Valor |
|---|---|---|---|
| Common Voice 17.0 (tr) | test | WER | 18,9229 % |
| Common Voice 17.0 (tr) | evaluacion | Loss | 0,3123 |

Evolucion durante el entrenamiento (segun la model card):

| Paso | Epoca | Validation loss | WER |
|---|---|---|---|
| 1000 | 1,6 | 0,3187 | 24,4415 % |
| 2000 | 3,2 | 0,3123 | 20,9720 % |
| 3000 | 4,8 | 0,3010 | 19,6183 % |
| 4000 | 6,4 | 0,3123 | 18,9229 % |

No se han publicado en la informacion disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K no aplican a un modelo ASR).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,6-2 GB en fp16 (808,9 M de parametros), y alrededor de 3,2 GB si se carga en fp32. La pipeline de ejemplo usa `torch_dtype=torch.float16` en CUDA.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el autor entreno en Colab, lo que sugiere que una T4 (16 GB) es suficiente. Una RTX 3060, RTX 4060 o superior funciona con holgura.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1650 4 GB en adelante), asi como en CPU con `torch.float32` a mayor latencia.
- Opciones de despliegue: transformers (`pipeline` de `automatic-speech-recognition`), y potencialmente vLLM, TGI o llama.cpp si se generan pesos compatibles (no documentado por el autor). Ollama no soporta Whisper de forma nativa.
- Latencia y throughput: no disponibles en la informacion proporcionada. La pipeline sugiere `batch_size=16` y `chunk_length_s=30` para procesamiento por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | WER turco (declarado) |
|---|---|---|---|---|---|
| veripazari/whisper-large-v3-turbo-turkish | 808,9 M | chunks de 30 s | turco | MIT | 18,92 % (Common Voice 17.0) |
| openai/whisper-large-v3-turbo (base) | 808,9 M | chunks de 30 s | multilingue (99 idiomas) | MIT | no disponible en la informacion |
| openai/whisper-large-v3 | 1.550 M | chunks de 30 s | multilingue (99 idiomas) | MIT | no disponible en la informacion |

No se dispone en la informacion proporcionada de otros ajustes finos turcos de Whisper con los que comparar directamente, ni de sus WER. La comparativa con el modelo base y con large-v3 se ofrece solo a nivel de parametros, licencia y cobertura idiomatica.

## Limitaciones y advertencias

- El autor solo utilizo el 25 % de los datos turcos de Common Voice 17.0 por limitaciones de GPU, lo que probablemente deja margen de mejora significativo en el WER.
- WER del 18,92 % en test: elevado para produccion en la mayoria de casos; se recomienda revision humana o un modelo superior si la precision es critica.
- Sesgos: al entrenarse sobre Common Voice, puede heredar sesgos de representacion (acentos, edades, generos y condiciones de grabacion sobrerrepresentados o infrarrepresentados en el corpus).
- Riesgo de alucinacion: como todo modelo generativo de ASR, puede producir texto plausible que no corresponde al audio, especialmente con ruido, silencios o audio fuera de dominio.
- Limitacion idiomatica: solo se declara soporte de turco; el rendimiento en otros idiomas no esta garantizado aunque el modelo base sea multilingue.
- Restricciones de licencia: licencia MIT, permite uso comercial, pero se recomienda verificar los terminos del modelo base y del dataset Common Voice (CC0 en su mayoria, aunque con condiciones de atribucion).
- Caveat de produccion: el modelo es un archivo de la plataforma VeriPazari sobre el original de `selimc`; conviene contrastar ambos repositorios y fijar una revision concreta para evitar cambios inesperados.
- No se documentan pruebas de robustez frente a ruido, acentos regionales turcos ni audio telefónico.

## Enlaces

- Modelo en Hugging Face (esta version): https://huggingface.co/veripazari/whisper-large-v3-turbo-turkish
- Repositorio original del autor: https://huggingface.co/selimc/whisper-large-v3-turbo-turkish
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Dataset Common Voice 17.0: https://huggingface.co/datasets/mozilla-foundation/common_voice_17_0
- Plataforma VeriPazari: https://veripazari.com.tr
