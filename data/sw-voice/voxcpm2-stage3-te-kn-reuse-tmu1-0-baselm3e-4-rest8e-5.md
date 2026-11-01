# sw-voice/voxcpm2-stage3-te-kn-reuse-tmu1.0-baselm3e-4-rest8e-5

## Resumen

VoxCPM2 stage3 (te-kn-reuse-tmu1.0-baselm3e-4-rest8e-5) es un modelo de síntesis de voz (text-to-speech) desarrollado por el usuario sw-voice, consistente en un ajuste fino completo (full fine-tune) del modelo sw-voice/voxcpm2-indic-multi-stage2-english-reuse-lr1e-4-10ep, a su vez derivado de la familia VoxCPM2. El modelo está entrenado con el entrenador oficial de VoxCPM sobre datos de temática devocional en telugu y kannada (unidades temáticas "re-use" del corpus swamiji-navaratri), y está diseñado para generar voz sin necesidad de audio de referencia en tiempo de inferencia: la identidad vocal queda embebida en los pesos.

Con 2.290.004.544 parámetros (aproximadamente 2,29 mil millones) y un repositorio de 9,5 GB en formato safetensors, se trata de un modelo de tamaño medio orientado a TTS multilingüe con cobertura declarada de inglés, telugu y kannada. Su relevancia es acotada: es un artefacto de investigación (la model card lo etiqueta explícitamente como "research") con una única descarga y sin métricas publicadas, pensado para reproducir experimentos de ajuste fino dentro del pipeline de VoxCPM2 más que para despliegue en producción.

La licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks, de documentación sobre el dataset de entrenamiento y de evaluación de calidad de audio limita seriamente su adopción fuera del contexto experimental del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VoxCPM2 (modelo de TTS basado en flow-matching; detalles internos de la arquitectura no disponibles) |
| Parámetros totales | 2.290.004.544 (≈2,29 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en), telugu (te), kannada (kn) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura VoxCPM2, un sistema de text-to-speech que emplea flow-matching (se menciona explícitamente un schedule de tiempo `t = sigmoid(N(1.0, 1))` durante el entrenamiento). No se dispone de información detallada sobre el codificador de texto, el decoder acústico ni el vocoder en la documentación proporcionada. El ajuste fino entrena **todos** los parámetros ("nothing frozen", "all parameters trained"), incluyendo el módulo `base_lm.*` con una tasa de aprendizaje diferenciada.

El entrenamiento se realizó con el entrenador oficial de VoxCPM sobre dos conjuntos de datos: `sw-voice/swamiji-navaratri-telugu-reuse-themes` (127 unidades temáticas completas) y `sw-voice/swamiji-navaratri-kannada-reuse-themes` (124 unidades), en modalidad "RE-USE". La configuración fue: micro-batch 1 con acumulación de gradiente 8, 5 épocas (160 pasos totales), LR 8e-5 con `base_lm.*` a 3e-4, scheduler coseno, warmup de 24 pasos y recorte de gradiente de 1.0. El modelo es reference-free: no requiere audio de referencia para sintetizar, ya que la voz objetivo está codificada en los pesos. El código del experimento se encuentra en el repositorio `swamiji-tts`, ruta `research/exp-iterations/06-voxcpm2-swamiji-stages`.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés, telugu y kannada.
- Generación de voz sin audio de referencia (reference-free), con la identidad vocal embebida en los pesos.
- Ajuste específico al dominio devocional (temas swamiji-navaratri) en telugu y kannada.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta clonación de voz zero-shot con referencia externa.
- No se documentan capacidades de visión, audio de entrada ni modo "thinking".

## Casos de uso

- **Síntesis de contenido devocional en telugu y kannada**: el modelo está ajustado específicamente sobre el corpus swamiji-navaratri, por lo que es adecuado para generar narraciones o recitaciones de ese dominio con la voz aprendida, sin necesidad de grabaciones de referencia.
- **Investigación en ajuste fino de TTS**: sirve como punto de partida reproducible para experimentos de full fine-tuning sobre VoxCPM2, dado que la configuración de entrenamiento (LR, warmup, acumulación, épocas) está documentada al detalle en la model card.
- **Generación de audio para prototipos multilingües**: permite probar pipelines de TTS que cubran inglés, telugu y kannada con un único checkpoint de 2,29 B de parámetros.
- **Evaluación de transferencia entre etapas**: al derivar de un stage2 entrenado en inglés y ajustarse después en telugu/kannada, es útil para estudiar cómo se transfiere la calidad entre idiomas en la familia VoxCPM2.
- **Locución automatizada de bajo volumen**: para proyectos internos que necesiten voces en telugu o kannada sin depender de servicios comerciales, la licencia Apache 2.0 elimina fricción legal.
- **Base para ajustes posteriores (stage4)**: el propio nombre del modelo sugiere una cadena de etapas; puede emplearse como inicialización para nuevos fine-tunes sobre otros subconjuntos del corpus swamiji.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 2,29 B de parámetros, en FP16 se requieren aproximadamente 4,6 GB solo para pesos; en BF16, similar. En FP32 ascendería a unos 9,2 GB. No se dispone de datos de cuantización publicados para este checkpoint.
- **GPU recomendadas**: para FP16/BF16, una GPU con 8-12 GB de VRAM es suficiente en teoría (RTX 3070/4070, RTX 3080/4080, A10, L4). Para mayor margen y throughput, A100 o H100.
- **¿Cabe en GPU de consumo?**: sí, previsiblemente en tarjetas con 8 GB o más en FP16, aunque no se ha verificado experimentalmente en la información disponible.
- **Opciones de despliegue**: no se documentan en la model card. El ecosistema VoxCPM2 y el repositorio `swamiji-tts` son las referencias indicadas; no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI (estos frameworks están orientados a LLM y no necesariamente a TTS).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| sw-voice/voxcpm2-stage3-te-kn-reuse-tmu1.0-baselm3e-4-rest8e-5 | 2,29 B | en, te, kn | no disponible | Apache 2.0 | Checkpoint de investigación, sin benchmarks |
| sw-voice/voxcpm2-indic-multi-stage2-english-reuse-lr1e-4-10ep (modelo base) | no disponible | en (stage2) | no disponible | no disponible | Etapa previa del mismo pipeline |
| Alternativas TTS open source de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con modelos TTS de la misma categoría.

## Limitaciones y advertencias

- **Artefacto de investigación**: la propia model card lo etiqueta como "research"; no hay evidencia de validación en producción.
- **Sin benchmarks ni evaluación de calidad**: no se publican métricas de MOS, WER, similitud de hablante ni inteligibilidad.
- **Dominio muy restringido**: el ajuste se realizó sobre 127 + 124 unidades temáticas de un corpus devocional concreto; el comportamiento fuera de ese dominio es incierto.
- **Riesgo de alucinación acústica**: como todo modelo generativo de audio, puede producir prosodia incorrecta, artefactos o pronunciaciones erróneas, especialmente en texto fuera de distribución.
- **Cobertura lingüística limitada**: solo inglés, telugu y kannada; no se documenta el rendimiento relativo entre idiomas.
- **Sin datos de sesgo**: no se documentan sesgos de voz (género, acento, edad) ni la composición demográfica de los hablantes del corpus.
- **Licencia**: Apache 2.0 permite uso comercial, pero el usuario debe verificar los derechos sobre el corpus de entrenamiento (swamiji-navaratri) antes de explotar comercialmente la voz resultante.
- **Repositorio de 9,5 GB**: el tamaño incluye probablemente checkpoints u optimizadores además de los pesos; conviene revisar los archivos antes de descargar.
- **Sin soporte documentado de cuantización ni de frameworks de despliegue**: la integración en producción requeriría trabajo adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sw-voice/voxcpm2-stage3-te-kn-reuse-tmu1.0-baselm3e-4-rest8e-5
- Modelo base (stage2): https://huggingface.co/sw-voice/voxcpm2-indic-multi-stage2-english-reuse-lr1e-4-10ep
- Dataset telugu: sw-voice/swamiji-navaratri-telugu-reuse-themes (referenciado en la model card)
- Dataset kannada: sw-voice/swamiji-navaratri-kannada-reuse-themes (referenciado en la model card)
- Código del experimento: repositorio `swamiji-tts`, ruta `research/exp-iterations/06-voxcpm2-swamiji-stages` (sin URL pública indicada)
