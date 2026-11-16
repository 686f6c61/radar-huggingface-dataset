# ssunzoon/sgb-1b-v2-GGUF

## Resumen

sgb-1b-v2-GGUF es una versión cuantizada en formato GGUF del modelo google/gemma-3-1b-it, ajustada mediante LoRA por el usuario ssunzoon para una tarea concreta: la redacción de frases para el registro de actividad escolar (생활기록부) de estudiantes de primaria en Corea del Sur. El modelo toma como entrada una lista de palabras clave precedida por una cabecera que indica el área curricular (comportamiento, observaciones por asignatura, autonomía, club, orientación vocacional, voluntariado, club deportivo o consejería estudiantil) y genera frases en estilo nominal adecuadas a esa área.

La relevancia de esta ficha es limitada y muy específica: no se trata de un modelo generalista, sino de un ajuste fino de dominio sobre una base de 1.000 millones de parámetros (999.885.952 según los safetensors del modelo base), empaquetado en un único archivo Q4_K_M de aproximadamente 0,8 GB pensado para equipos de bajos recursos sin GPU dedicada. El repo declara 0 descargas y 0 likes en el momento de la consulta, y no publica pipeline, benchmarks ni datos de entrenamiento detallados.

Al estar construido sobre Gemma 3 1B, hereda la arquitectura, la ventana de contexto y las capacidades del modelo base de Google, pero el ajuste LoRA está orientado exclusivamente al coreano y a una única tarea educativa, lo que restringe severamente su uso fuera de ese contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de google/gemma-3-1b-it); no se detalla en la model card |
| Parametros totales | 999.885.952 (modelo base, safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Gemma 3 1B) |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado: `sgb-1b-v2-Q4_K_M.gguf`, ~0,8 GB) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-3-1b-it, un transformer decoder-only de aproximadamente 1.000 millones de parámetros en su versión instruction-tuned. Sobre esa base se aplicó un ajuste LoRA para la generación de frases de registro escolar en coreano, según indica la model card. No se especifican en la información disponible ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo etapas de RLHF o DPO adicionales, ni hiperparámetros del LoRA (rango, alpha, módulos objetivo).

La model card declara explícitamente que no se utilizaron registros escolares reales con datos personales de estudiantes en el entrenamiento, lo que es relevante desde el punto de vista de privacidad. El resultado es un modelo de dominio muy estrecho: transforma listas de palabras clave en frases nominales adaptadas a ocho áreas predefinidas, con un formato de entrada fijo (`[영역/과목/약 N자] 키워드1, 키워드2, ...`).

## Capacidades

- Generación de texto en coreano orientada a frases nominales de registro escolar.
- Transformación de listas de palabras clave en frases por área: comportamiento (행발), observaciones por asignatura (교과세특), autonomía (자율), club (동아리), orientación vocacional (진로), voluntariado (봉사), club deportivo (스포츠클럽) y consejería estudiantil (학생상담).
- Control aproximado de longitud mediante la indicación `약 N자` (aproximadamente N caracteres) en la cabecera de entrada.
- Conversación básica heredada de la versión instruction-tuned del modelo base (tag `conversational`), aunque el ajuste LoRA está centrado en la tarea educativa.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades multilingües: limitadas al coreano según la model card; el modelo base Gemma 3 1B es multilingüe, pero el ajuste está orientado a ko.
- Modo thinking, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Redacción asistida de observaciones de comportamiento: el profesor introduce palabras clave sobre un alumno y el modelo genera una frase nominal adecuada al área `행발`, que el docente revisa y corrige antes de incorporarla al registro.
- Observaciones por asignatura: con la cabecera `교과세특` y una lista de logros o competencias, el modelo produce un borrador de frase para la sección de observaciones específicas de una materia.
- Registro de actividades de autonomía y club: para áreas `자율` y `동아리`, el modelo convierte actividades realizadas (por ejemplo, participación en un proyecto) en frases breves adaptadas al formato administrativo.
- Orientación vocacional y voluntariado: genera frases para las secciones `진로` y `봉사` a partir de intereses o experiencias del alumno, reduciendo el tiempo de redacción del profesor.
- Club deportivo y consejería estudiantil: produce borradores para `스포츠클럽` y `학생상담`, con la advertencia explícita de que las notas de consejería deben revisarse con especial cuidado por riesgo de malinterpretación de la situación.
- Despliegue en equipos escolares sin GPU: al ser un GGUF Q4_K_M de ~0,8 GB con requisito declarado de 8 GB de RAM, puede ejecutarse en ordenadores de oficina convencionales mediante llama.cpp, Ollama u otros runners compatibles con GGUF, sin necesidad de hardware dedicado.
- Prototipado de pipelines de generación de documentos administrativos: sirve como componente de bajo coste para experimentar con formatos de entrada/salida estructurados en coreano antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal, ya que el autor recomienda ejecución en CPU; para el archivo Q4_K_M (~0,8 GB) se puede estimar un consumo de memoria en torno a 1-2 GB incluyendo overhead del runtime, aunque no se dispone de cifras oficiales.
- RAM recomendada: 8 GB según la model card.
- GPU recomendadas: no disponibles; el modelo está pensado para PC sin tarjeta gráfica. Cualquier GPU consumer con 4 GB o más de VRAM (por ejemplo, GTX 1650, RTX 3050) podría ejecutarlo con offloading, aunque no se documenta.
- ¿Cabe en GPU consumer? Sí, por tamaño (menos de 1 GB de pesos), en prácticamente cualquier GPU con suficiente VRAM para el contexto, si bien el caso de uso declarado es CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia tipo Hugging Face. vLLM y TGI no soportan GGUF de forma nativa generalizada, por lo que no se recomiendan para este artefacto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| ssunzoon/sgb-1b-v2-GGUF | ~1.000 M | no disponible | ko | Gemma | GGUF (Q4_K_M) | Ajuste LoRA de dominio educativo coreano |
| google/gemma-3-1b-it | ~1.000 M | no disponible en esta ficha | Multilingüe | Gemma | safetensors | Modelo base instruction-tuned, generalista |
| google/gemma-3-1b-pt | ~1.000 M | no disponible en esta ficha | Multilingüe | Gemma | safetensors | Versión preentrenada sin ajuste de instrucciones |
| Qwen2.5-1.5B-Instruct | ~1.500 M | no disponible en esta ficha | Multilingüe | Apache 2.0 | safetensors, GGUF | Alternativa generalista de tamaño comparable con licencia permisiva |

La comparación relevante es con el propio modelo base: sgb-1b-v2 no mejora capacidades generales, sino que especializa el comportamiento en una tarea y un idioma concretos. Frente a alternativas generalistas de tamaño similar, ofrece menor versatilidad pero mayor adecuación al formato de registro escolar coreano, a costa de una licencia Gemma más restrictiva que, por ejemplo, Apache 2.0.

## Limitaciones y advertencias

- Dominio extremadamente estrecho: el ajuste está pensado solo para frases de registro escolar en coreano; su rendimiento fuera de ese formato no está documentado y previsiblemente será deficiente.
- Riesgo de alucinación relevante en consejería estudiantil: la propia model card advierte que el modelo puede malinterpretar situaciones al generar notas de `학생상담`, por lo que la revisión humana es obligatoria.
- Verificación humana obligatoria: todas las frases generadas deben ser comprobadas por el profesor en cuanto a veracidad y expresión antes de su uso.
- Sesgos: no se documentan sesgos específicos, pero al entrenar sobre un dominio administrativo coreano puede reproducir estilos y formulaciones estereotipadas del sistema educativo; no hay información sobre la diversidad del dataset.
- Limitaciones de idioma: solo coreano; el uso en castellano u otros idiomas no está soportado por el ajuste.
- Restricciones de licencia: sujeta a los Gemma Terms of Use y a la política de usos prohibidos de Gemma (https://ai.google.dev/gemma/prohibited_use_policy); el uso comercial debe verificarse contra dichos términos.
- Privacidad: la model card declara que no se usaron registros reales con datos personales, pero el modelo puede generar contenido plausible sobre estudiantes ficticios que no debe tratarse como registro factual.
- Madurez del artefacto: 0 descargas y 0 likes, sin benchmarks ni pipeline declarado; se trata de un experimento publicado recientemente, no de un modelo validado para producción.
- Formato de entrada rígido: requiere la cabecera `[영역/과목/약 N자]` seguida de palabras clave; entradas fuera de ese formato pueden producir salidas incoherentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ssunzoon/sgb-1b-v2-GGUF
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
