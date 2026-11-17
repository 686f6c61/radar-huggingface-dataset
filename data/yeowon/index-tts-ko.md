# yeowon/index-tts-ko

## Resumen

IndexTTS-KO es un ajuste fino (finetune) del modelo de síntesis de voz IndexTTS-2 de IndexTeam, especializado en coreano mediante clonación de voz y emoción zero-shot. Lo publica el usuario yeowon en Hugging Face y está entrenado durante 180.100 pasos sobre el conjunto `emilia-yodas/KO_preprocessed`, partiendo de los pesos de IndexTTS-2. El modelo genera audio a 22,05 kHz a partir de un texto en coreano y un clip corto de voz de referencia, reproduciendo el timbre del hablante y su prosodia emocional.

La relevancia de esta ficha es doble: por un lado, cubre un hueco práctico, ya que IndexTTS-2 no está entrenado específicamente para coreano y este finetune incorpora un tokenizador BPE coreano dedicado de 16.000 tokens; por otro, publica los pesos de inferencia de forma abierta y sin control de acceso (sin gating), algo poco habitual en modelos con licencia restrictiva. El repositorio ocupa 5,9 GB y contiene los checkpoints `gpt.pth`, `s2mel.pth` y `qwen0.6bemo4-merge`, además del tokenizador.

La licencia es la Bilibili Model Use License Agreement, heredada del modelo base, lo que condiciona el uso comercial. La información disponible no detalla el número de parámetros ni la arquitectura interna más allá de los componentes nombrados, por lo que esos datos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base IndexTTS-2; componentes `gpt.pth`, `s2mel.pth`, `qwen0.6bemo4-merge`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; la inferencia documentada usa FP16 (`use_fp16=True`) |
| Idiomas soportados | coreano (principal); etiquetas del repo: ko, en, zh, ja |
| Licencia | bilibili-model-use-license-agreement |
| Formato de pesos | safetensors (tag del repo) y checkpoints `.pth` (`gpt.pth`, `s2mel.pth`) |

## Arquitectura y entrenamiento

El modelo es un finetune de IndexTeam/IndexTTS-2, un sistema TTS zero-shot con clonación de voz y emoción. Los pesos publicados corresponden al paso 180.100 del entrenamiento sobre `emilia-yodas/KO_preprocessed`, del que se han extraído únicamente los pesos de inferencia: se eliminaron los estados del optimizador, se quitaron los prefijos `_orig_mod.` de `torch.compile` y se preservaron los dtypes originales. El autor indica que los 665 tensores del GPT se verificaron para igualdad bit a bit contra el checkpoint entrenado.

La innovación principal respecto al base es la incorporación de un tokenizador BPE coreano dedicado de 16.000 tokens, que debe usarse junto con el `config.yaml` incluido. El repositorio también incluye el componente `qwen0.6bemo4-merge`, asociado presumiblemente al modelado de emoción, aunque la información disponible no detalla su función exacta. No se especifican el número de tokens de entrenamiento, la composición completa del dataset ni si hubo RLHF o DPO.

## Capacidades

- Síntesis de voz en coreano a 22,05 kHz a partir de texto.
- Clonación de voz zero-shot: reproduce el timbre del hablante a partir de un clip de referencia corto (`reference.wav`).
- Clonación de emoción y prosodia: el título del modelo indica clonación de emoción, aunque no se detalla el mecanismo.
- Soporte declarado de coreano, inglés, chino y japonés en las etiquetas del repositorio; el entrenamiento específico documentado es coreano.
- Normalización de texto coreano mediante `tts.normalizer.preferred_language = "ko"`, que enruta el texto por el normalizador coreano en lugar de las rutas CJK/inglés.
- Inferencia en FP16 con la librería `edu-ide/index-tts`.
- No se documentan tool calling, capacidades de agente, razonamiento multi-paso ni modalidades de audio de entrada más allá del clip de referencia.

## Casos de uso

- **Doblaje y localización al coreano**: dado un clip de la voz original y el texto traducido, el modelo genera una pista de voz que conserva el timbre del hablante, lo que simplifica el doblaje de vídeo y pódcast sin estudio de grabación.
- **Audiolibros y contenido narrado**: con una muestra de referencia del narrador se puede sintetizar un texto largo en coreano manteniendo una voz consistente entre capítulos.
- **Asistentes de voz para aplicaciones coreanas**: integración en interfaces conversacionales donde se necesita una voz personalizada (por ejemplo, la del propio usuario o una voz de marca) sin entrenamiento adicional.
- **Accesibilidad y lectura de pantalla**: generación de voz natural en coreano para lectores de pantalla y sistemas de lectura de documentos, usando la voz de referencia que prefiera el usuario.
- **Prototipado de videojuegos y contenido interactivo**: generación rápida de líneas de diálogo para personajes con voces y emociones distintas a partir de clips de referencia, útil en fases de preproducción.
- **Investigación en TTS y evaluación de clonación**: al publicarse los pesos sin gating, sirve como punto de partida para experimentos de clonación zero-shot en coreano y para comparar con el base IndexTTS-2 sin entrenamiento coreano.
- **Generación de voces para vídeo corto y redes**: creación de locuciones en coreano con una voz concreta para contenido de redes sociales, siempre que la licencia lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una comparación en vídeo entre la voz de referencia, el IndexTTS-2 base sin entrenamiento coreano y este finetune, pero no aporta métricas numéricas (MOS, similitud de hablante, WER) ni tablas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 5,9 GB, por lo que en FP16 se puede estimar un consumo del orden de varios GB, pero no hay cifra oficial.
- GPU recomendadas: no especificadas en la información disponible. La inferencia documentada usa CUDA con FP16 y permite desactivar kernels CUDA y DeepSpeed (`use_cuda_kernel=False`, `use_deepspeed=False`).
- GPU de consumo: no confirmado; no se indica si cabe en tarjetas como RTX 4090 o RTX 3060.
- Opciones de despliegue: la ruta documentada es la librería `edu-ide/index-tts` (commit `80060cced8cd0015dfaaaadfc70509fdec5bfb1f`) con Python 3.10 y `uv`. No se documentan vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para un modelo TTS de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| yeowon/index-tts-ko | no disponible | no disponible | ko (principal), en, zh, ja | bilibili-model-use-license-agreement | Finetune coreano de IndexTTS-2, 180.100 pasos, tokenizador BPE coreano de 16.000 tokens |
| IndexTeam/IndexTTS-2 | no disponible | no disponible | no disponible en esta ficha | no disponible en esta ficha | Modelo base; sin entrenamiento específico coreano según la model card |
| Alternativas TTS zero-shot | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

No se dispone de datos suficientes para comparar parámetros, contexto o rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- **Licencia restrictiva**: la Bilibili Model Use License Agreement condiciona el uso comercial; es necesario revisar el texto de la licencia antes de desplegar en producción.
- **Idioma principal coreano**: aunque las etiquetas incluyen en, zh y ja, el entrenamiento documentado es coreano; el rendimiento en otros idiomas no está verificado.
- **Normalización obligatoria**: hay que fijar `tts.normalizer.preferred_language = "ko"` y escribir números y unidades en hangul para controlar la pronunciación; de lo contrario el texto puede enrutarse por rutas CJK/inglés.
- **Tokenizador específico**: es imprescindible usar el `config.yaml` y el `bpe.model` incluidos; mezclar con el tokenizador del base puede degradar la síntesis.
- **Riesgo de alucinación acústica**: como todo TTS generativo, puede producir artefactos, prosodia incorrecta o pronunciaciones erróneas en textos poco frecuentes; no hay métricas publicadas que acoten este riesgo.
- **Clonación de voz**: permite imitar voces a partir de un clip; su uso requiere consentimiento del hablante y cumplimiento de la normativa de protección de datos y de derechos de imagen.
- **Sesgos**: no se documentan sesgos conocidos, pero el dataset de entrenamiento (`emilia-yodas/KO_preprocessed`) puede condicionar acentos y registros; no hay análisis publicado.
- **Metadatos incompletos**: no se publican parámetros, contexto, latencia ni benchmarks, lo que dificulta la planificación de despliegue.
- **Dependencia de un fork concreto**: las instrucciones fijan un commit específico de `edu-ide/index-tts`; cambios posteriores en la librería pueden romper la compatibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yeowon/index-tts-ko
- Modelo base: https://huggingface.co/IndexTeam/IndexTTS-2
- Repositorio de inferencia: https://github.com/edu-ide/index-tts
- Commit de inferencia fijado: https://github.com/edu-ide/index-tts/tree/80060cced8cd0015dfaaaadfc70509fdec5bfb1f
- Discusiones del modelo: https://huggingface.co/yeowon/index-tts-ko/discussions
- README en coreano: https://huggingface.co/yeowon/index-tts-ko/blob/main/README_ko.md
- README en chino: https://huggingface.co/yeowon/index-tts-ko/blob/main/README_zh.md
- README en japones: https://huggingface.co/yeowon/index-tts-ko/blob/main/README_ja.md
- Licencia: https://huggingface.co/yeowon/index-tts-ko/blob/main/LICENSE
