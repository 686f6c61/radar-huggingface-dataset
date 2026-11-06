# sw-voice/voxcpm2-stage3-te-kn-reuse-tmu1.0-baselm3e-4

## Resumen

voxcpm2-stage3-te-kn-reuse-tmu1.0-baselm3e-4 es un modelo de síntesis de voz (text-to-speech) desarrollado por sw-voice, un fine-tune completo del modelo base sw-voice/voxcpm2-indic-multi-stage2-english-reuse-lr1e-4-10ep. El modelo se presenta explícitamente como un artefacto de investigación y está orientado a la generación de voz en inglés, telugu y kannada, con especial énfasis en las dos lenguas dravídicas del sur de la India.

Se trata de un fine-tune completo (todos los parámetros entrenados, sin capas congeladas) realizado con el entrenador oficial de VoxCPM sobre datos de temática devocional (swamiji-navaratri-telugu-reuse-themes y -kannada-reuse-themes), con un total de 251 unidades temáticas completas. La particularidad declarada por el autor es que el modelo es "reference-free": la identidad de la voz queda embebida en los pesos, de modo que no requiere un audio de referencia en tiempo de inferencia.

Con 2.290.004.544 parámetros (aproximadamente 2,29 mil millones) y un repositorio de 9,5 GB en formato safetensors, el modelo se sitúa en la gama media de los sistemas TTS neuronales. Su relevancia actual radica en la escasez de modelos TTS abiertos con soporte real de telugu y kannada bajo licencia Apache 2.0, aunque su naturaleza de investigación y su escasa adopción (18 descargas, 0 likes) aconsejan tratarlo con cautela en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS basado en VoxCPM; detalles de la arquitectura interna no especificados en la model card) |
| Parametros totales | 2.290.004.544 (~2,29 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | inglés (en), telugu (te), kannada (kn) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo; únicamente indica que se ha utilizado el entrenador oficial de VoxCPM y que el modelo base pertenece a la familia voxcpm2-indic-multi. El pipeline declarado es text-to-speech y el autor menciona un esquema de flow-matching con un parámetro de tiempo muestreado como t = sigmoid(N(1.0, 1)), lo que sugiere un componente generativo basado en flow matching para la síntesis de audio, habitual en los TTS neuronales modernos.

El entrenamiento consistió en un fine-tune completo sobre el modelo base, sin congelar ningún parámetro. Los datos empleados fueron sw-voice/swamiji-navaratri-telugu-reuse-themes y sw-voice/swamiji-navaratri-kannada-reuse-themes, con 127 y 124 unidades temáticas completas respectivamente, en modalidad RE-USE. La configuración fue: micro-batch 1 con acumulación de gradiente 8, 5 épocas equivalentes a 160 pasos, learning rate 5e-5 con cosine decay y warmup de 24 pasos, salvo las capas base_lm.* que usaron 3e-4, y recorte de gradiente de 1.0. El autor destaca que el modelo es reference-free, es decir, la voz objetivo está codificada en los pesos y no se necesita un audio de referencia durante la inferencia. No se documentan fases de RLHF ni DPO, ni el volumen total de tokens de audio utilizados.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés, telugu y kannada.
- Generación de voz sin audio de referencia (reference-free): la identidad de voz está embebida en los pesos del modelo.
- Soporte de las dos lenguas dravídicas del sur de la India (telugu y kannada) junto con inglés, lo que permite escenarios bilingües o multilingües dentro de una misma aplicación.
- Entrenado sobre material devocional (temas de Navaratri), por lo que el estilo prosódico y el registro de voz están sesgados hacia ese dominio.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo "thinking"; es un modelo puramente TTS.
- No se documentan capacidades de clonación de voz a partir de referencia, control de emoción ni control explícito de estilo más allá de lo aprendido en el fine-tune.

## Casos de uso

- Locución de contenido devocional en telugu y kannada: el modelo se entrenó específicamente sobre temas de Navaratri, por lo que es adecuado para narrar textos religiosos o culturales en estas lenguas con una prosodia coherente con el dominio de entrenamiento.
- Audiolibros y narración en lenguas dravídicas: permite convertir texto en voz para telugu y kannada, idiomas con escasa cobertura en TTS abiertos, reduciendo la dependencia de servicios propietarios.
- Accesibilidad para hablantes de telugu y kannada: lectura en voz alta de contenido web, documentos o interfaces para usuarios con discapacidad visual en estas comunidades lingüísticas.
- Prototipado de asistentes de voz multilingües: combinado con un ASR y un LLM, puede formar parte de un pipeline de asistente conversacional que cubra inglés, telugu y kannada, siempre que se valide la calidad en producción.
- Investigación en TTS multilingüe: el modelo sirve como punto de partida (fine-tune) para experimentos académicos sobre transferencia entre lenguas, flow matching o entrenamiento reference-free, dado que el autor publica la configuración y el código del experimento.
- Generación de avisos y comunicados institucionales: para administraciones o ONG que necesiten difundir mensajes en telugu o kannada mediante voz sintética, con la ventaja de la licencia Apache 2.0 para uso comercial.
- Doblaje y localización de contenido corto: para vídeos educativos o divulgativos en inglés, telugu o kannada, sujeto a revisión humana por las limitaciones de naturalidad y el sesgo de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas (MOS, WER, SIM, MCD) ni comparaciones cuantitativas con otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 9,2 GB solo para los pesos (2,29 B × 4 bytes), más overhead de activaciones y del decodificador de audio.
- VRAM estimada en fp16/bf16: alrededor de 4,6 GB para los pesos, más overhead; se recomienda un mínimo de 8 GB para operar con margen.
- GPU recomendadas: NVIDIA A100 o H100 para despliegue de alta concurrencia; RTX 4090 (24 GB) para desarrollo y serving de una sola instancia; RTX 3090 (24 GB) como alternativa.
- GPU de consumo: cabe en tarjetas con 8-12 GB (RTX 3060 12 GB, RTX 4070, RTX 4080) en fp16, siempre que el runtime de audio no requiera memoria adicional significativa.
- Opciones de despliegue: no se documentan integraciones oficiales con vLLM, llama.cpp, Ollama ni TGI; al ser un modelo TTS específico de VoxCPM, el despliegue previsible pasa por el código del entrenador VoxCPM o por un servidor de inferencia propio basado en PyTorch.
- Latencia y throughput: no disponibles; no se han publicado mediciones de RTF (real-time factor) ni de tokens de audio por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| voxcpm2-stage3-te-kn-reuse-tmu1.0-baselm3e-4 | ~2,29 B | en, te, kn | no disponible | Apache 2.0 | Hugging Face (18 descargas) |
| Modelo base: sw-voice/voxcpm2-indic-multi-stage2-english-reuse-lr1e-4-10ep | no disponible | en (y base indic multilingüe) | no disponible | no disponible en la informacion proporcionada | Hugging Face |
| Alternativas TTS abiertas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables de otros modelos TTS comparables en la información proporcionada, por lo que no se pueden establecer comparaciones cuantitativas de rendimiento, contexto o calidad.

## Limitaciones y advertencias

- Modelo marcado explícitamente como "research": el autor no garantiza calidad de producción ni estabilidad en dominios distintos al de entrenamiento.
- Sesgo de dominio: entrenado sobre material devocional (temas de Navaratri en telugu y kannada), por lo que la prosodia, el timbre y el estilo pueden sonar inadecuados para textos técnicos, conversacionales o de otros registros.
- Riesgo de alucinación acústica: como todo TTS generativo, puede producir artefactos, pronunciaciones incorrectas o prosodia anómala en palabras fuera de vocabulario o en textos largos.
- Cobertura lingüística limitada a inglés, telugu y kannada; no se ha validado su comportamiento en otras lenguas ni en code-switching intensivo.
- No se documentan longitudes máximas de texto de entrada ni de audio generado; el contexto efectivo es desconocido.
- Identidad de voz fija embebida en los pesos: no hay control de hablante ni clonación documentada, lo que limita su uso cuando se requiere una voz concreta.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de un modelo base cuyas condiciones no se detallan en la información disponible, conviene verificar la licencia del modelo base antes de explotación comercial.
- Adopción muy baja (18 descargas, 0 likes) y ausencia de benchmarks: no hay evidencia externa de calidad ni de robustez.
- No se documentan medidas de mitigación de sesgos demográficos o de género en la voz generada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sw-voice/voxcpm2-stage3-te-kn-reuse-tmu1.0-baselm3e-4
- Modelo base: https://huggingface.co/sw-voice/voxcpm2-indic-multi-stage2-english-reuse-lr1e-4-10ep
- Dataset telugu: sw-voice/swamiji-navaratri-telugu-reuse-themes (referenciado en la model card; URL exacta no disponible)
- Dataset kannada: sw-voice/swamiji-navaratri-kannada-reuse-themes (referenciado en la model card; URL exacta no disponible)
- Código del experimento: swamiji-tts, ruta `research/exp-iterations/06-voxcpm2-swamiji-stages` (repositorio no enlazado en la información disponible)
- Paper, blog o demo: no disponible
