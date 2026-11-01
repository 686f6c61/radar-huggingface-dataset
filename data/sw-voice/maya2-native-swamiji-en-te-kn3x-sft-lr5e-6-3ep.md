# sw-voice/maya2-native-swamiji-en-te-kn3x-sft-lr5e-6-3ep

## Resumen

Maya 2 Native Swamiji es un modelo de síntesis de voz (text-to-speech) obtenido mediante un ajuste fino completo del modelo base maya-research/maya2-native, desarrollado por el usuario sw-voice. Su particularidad es que reproduce una única voz de referencia, denominada "Swamiji", en tres idiomas: inglés, telugu y kannada, a partir de un vector de voz extraído de un clip corto en inglés. El modelo resuelve el problema de la clonación de voz multilingüe consistente: una sola identidad vocal aplicada a idiomas con sistemas de escritura y fonética muy distintos.

Con 2.502.398.656 parámetros (aproximadamente 2,5 mil millones) y un repositorio de 5,0 GB en formato safetensors, se trata de un modelo de tamaño medio orientado a producción. El ajuste se realizó sobre 719 clips en inglés del hablante más los conjuntos completos de temas Navaratri en telugu y kannada (127 y 124 unidades respectivamente), con una receta de learning rate 5e-6 durante 3 épocas (552 actualizaciones). Es relevante ahora porque demuestra que un fine-tune relativamente económico puede transferir una identidad vocal a idiomas de bajos recursos con una fidelidad alta, y porque su motor de servicio (maya3) reporta cifras de despliegue concretas: 64 streams simultáneos en una RTX 3090 con un factor de tiempo real p90 de 0,60.

La licencia Apache 2.0 facilita su uso comercial, aunque el modelo está condicionado por la identidad vocal concreta que replica y por las consideraciones éticas de la clonación de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de síntesis de voz basado en el backbone de maya-research/maya2-native; componentes ckpt, backbone, mimi y ecapa) |
| Parametros totales | 2.502.398.656 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; no se especifica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, te, kn (inglés, telugu, kannada) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tune) del modelo base maya-research/maya2-native, orientado a text-to-speech. La arquitectura interna del backbone no se detalla en la información disponible, pero la API de uso revela que el sistema se compone de varios artefactos: un checkpoint (`ckpt`), un directorio de backbone (`backbone_dir`), un directorio Mimi (`mimi_dir`, probablemente el códec neuronal de audio Mimi) y un directorio ECAPA (`ecapa_dir`, empleado para la verificación de hablante y el vector de voz). La generación de voz se controla mediante un vector de hablante registrado a partir de un clip de referencia de 6 a 10 segundos con `mode="spk"`.

El entrenamiento utilizó 719 clips en inglés del hablante Swamiji, más los temas completos de Navaratri en telugu (127 unidades) y kannada (124 unidades). Cada tema se repitió 3 veces por época, resultando en la composición `clips.pt, clips_te.pt*3, clips_kn.pt*3`. La receta empleó learning rate 5e-6, 3 épocas (552 actualizaciones), batch de 1 × 8, calentamiento lineal durante el 25% de las actualizaciones (138) y después tasa constante. No se menciona uso de RLHF ni DPO; se trata de un ajuste supervisado sobre datos de voz. El experimento se denomina "exp2b" y, según el autor, sus pesos no cambiarán.

## Capacidades

- Síntesis de voz multilingüe en inglés, telugu y kannada con una identidad vocal única.
- Clonación de voz a partir de un clip de referencia limpio de 6 a 10 segundos, mediante vector de hablante en modo `spk`.
- Control del ritmo de habla próximo al del hablante original (104% en inglés, 98% en telugu, 97% en kannada).
- Normalización de texto activable (`normalize=True`) en la generación.
- Generación de audio con claridad medida en CPPS de 9,3 dB (inglés), 9,6 dB (telugu) y 9,8 dB (kannada).
- Servicio de múltiples streams concurrentes mediante el motor maya3.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Locución multilingüe de contenido religioso o espiritual: el modelo mantiene la misma voz de Swamiji en inglés, telugu y kannada, lo que permite publicar discursos y meditaciones guiadas en tres idiomas sin regrabar con el hablante original.
- Doblaje y localización de vídeos existentes: a partir de un clip de referencia del hablante se puede generar la pista de voz en telugu o kannada para contenido previamente grabado en inglés, conservando la identidad vocal.
- Audiolibros y textos largos: la ventana de servicio del motor maya3 (64 streams simultáneos en una RTX 3090, primer audio en unos 60 ms) permite procesar por lotes capítulos completos con latencia baja.
- Asistentes de voz para comunidades de la India: al cubrir telugu y kannada, el modelo sirve para interfaces de voz en aplicaciones de atención al ciudadano o educación dirigidas a hablantes de esos idiomas.
- Generación de avisos y anuncios personalizados: con un único clip de referencia se pueden producir mensajes breves con una voz reconocible para campañas o notificaciones.
- Investigación en clonación de voz de bajos recursos: el modelo sirve como referencia reproducible (experimento exp2b con receta y datos publicados) para estudiar la transferencia de identidad vocal entre idiomas con pocos datos.
- Pruebas de accesibilidad: generación de contenido hablado en varios idiomas con una voz consistente para lectores de pantalla o sistemas de asistencia.

## Benchmarks y rendimiento

Resultados publicados por el autor, con diez respuestas estándar por idioma y vector de voz de un clip inglés de Swamiji (`src0_clip_0030`, `mode="spk"`):

| Metrica | Ingles | Telugu | Kannada |
|---|---|---|---|
| Coincidencia de voz con Swamiji real (WavLM-ECAPA, % respecto a real-vs-real) | 98,3% | 97,8%* | 98,7%* |
| Errores de palabra (EN: WER Whisper large-v3; otros: WER/CER Sarvam) | 3,7% | 11,9% / 3,9% | 8,3% / 2,7% |
| Ritmo de habla (% del de Swamiji) | 104% | 98% | 97% |
| Claridad de voz (CPPS, dB; grabaciones reales: 10,3 en inglés, 8,7-8,9 en Navaratri) | 9,3 | 9,6 | 9,8 |

\* Los clips reales de telugu y kannada provienen de las grabaciones de Navaratri usadas en el entrenamiento.

Prueba de escucha: 4,4 sobre 5 en telugu y 4,5 sobre 5 en kannada, frente a 4,0 y 3,5 de la etapa 3 de VoxCPM2.

Servicio: en una RTX 3090, el motor maya3 sirve 64 streams simultáneos con factor de tiempo real p90 de 0,60, primer audio en aproximadamente 60 ms y capacidad de 1024.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 2,5 mil millones de parámetros en safetensors y un repositorio de 5,0 GB, la inferencia en precisión completa requiere del orden de 10 GB o más, y menos con cuantización (no se documentan tipos de cuantización).
- GPU recomendadas: RTX 3090 es la única GPU con cifras de servicio publicadas (64 streams, RTF p90 0,60). No se documentan resultados en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, según el despliegue reportado en RTX 3090; no se confirma para GPUs con menos VRAM.
- Opciones de despliegue: motor maya3 mediante el paquete Python `maya3` (`Maya3TTS.from_pretrained` y `hub.resolve`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: primer audio en torno a 60 ms y factor de tiempo real p90 de 0,60 con 64 streams concurrentes en una RTX 3090.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Datos de rendimiento |
|---|---|---|---|---|
| Maya 2 Native Swamiji (este modelo) | 2.502.398.656 | en, te, kn | apache-2.0 | Coincidencia de voz 97,8-98,7%; WER EN 3,7%; CER te 3,9%, kn 2,7% |
| VoxCPM2 (etapa 3) | no disponible | no disponible | no disponible | Prueba de escucha 4,0 (telugu) y 3,5 (kannada) frente a 4,4 y 4,5 de este modelo |
| maya-research/maya2-native (modelo base) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con otras alternativas de TTS multilingüe de la misma categoría.

## Limitaciones y advertencias

- El modelo está especializado en una única identidad vocal (Swamiji); no es un TTS genérico de voces arbitrarias sin un clip de referencia adecuado.
- Solo cubre inglés, telugu y kannada; no se documenta soporte para otros idiomas.
- El WER en telugu es del 11,9%, notablemente superior al 3,7% del inglés, lo que indica mayor riesgo de errores de pronunciación en ese idioma.
- Las métricas de coincidencia de voz en telugu y kannada se calculan contra clips reales que formaron parte del entrenamiento, por lo que pueden estar optimistas.
- Riesgo de alucinación o artefactos de audio no cuantificado en la información disponible.
- Sesgos: no se documentan análisis de sesgo; al clonar una voz concreta, el uso indebido puede plantear problemas de suplantación de identidad y requiere consentimiento del hablante.
- Licencia Apache 2.0 permite uso comercial, pero la réplica de una voz real puede estar sujeta a derechos de imagen o personalidad según la jurisdicción.
- El modelo depende del ecosistema `maya3` y de artefactos auxiliares (backbone, Mimi, ECAPA); no se documenta compatibilidad con otros runners.
- No se documentan tipos de cuantización ni requisitos mínimos de VRAM, lo que dificulta planificar despliegues en GPUs pequeñas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sw-voice/maya2-native-swamiji-en-te-kn3x-sft-lr5e-6-3ep
- Modelo base: https://huggingface.co/maya-research/maya2-native
- Dataset telugu Navaratri: https://huggingface.co/datasets/sw-voice/swamiji-navaratri-telugu-sidon-themes
- Dataset kannada Navaratri: https://huggingface.co/datasets/sw-voice/swamiji-navaratri-kannada-sidon-themes
- Modelo sucesor (multilingual maya): https://huggingface.co/sw-voice/best-2-multilingual-maya
- Modelo sucesor (multilingual vox): https://huggingface.co/sw-voice/best-2-multilingual-vox
