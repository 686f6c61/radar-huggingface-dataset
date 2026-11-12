# ssunzoon/sgb-e2b-GGUF

## Resumen

sgb-e2b-GGUF es una cuantización en formato GGUF de un modelo afinado mediante LoRA para asistir en la redacción de informes escolares (생활기록부, el expediente académico y de conducta del sistema educativo surcoreano). Lo publica el usuario ssunzoon en Hugging Face y está pensado para generar frases en estilo nominal (명사형 문장) a partir de una lista de palabras clave y un área concreta del expediente: comportamiento, observaciones por asignatura, autonomía, clubes, orientación vocacional, voluntariado, deporte escolar o tutoría.

El modelo parte de dos bases distintas de Google: Gemma 4 E2B (para la variante de mayor tamaño, unos 3,3 GB en Q4_K_M) y Gemma 3 1B (para la variante ligera, unos 0,8 GB). El repositorio declara 4.647.450.147 parámetros en safetensors, un dato que no concuerda con ninguna de las dos bases citadas y que debe tratarse con cautela. La relevancia es acotada: se trata de un ajuste muy específico de dominio, en coreano, orientado a docentes, no de un modelo de propósito general.

La información disponible es escasa: el repositorio no registra descargas ni interacciones, no declara pipeline y la licencia aparece como "no disponible" en los metadatos, aunque la model card especifica condiciones distintas para cada variante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Gemma 3 1B / Gemma 4 E2B; detalles no disponibles) |
| Parametros totales | 4.647.450.147 (dato declarado en safetensors; no concuerda con las bases citadas) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (única publicada) |
| Idiomas soportados | coreano (ko) |
| Licencia | sgb-e2b: Apache 2.0; sgb-1b: Gemma Terms of Use y política de usos prohibidos de Gemma |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Por las bases declaradas, se trata de modelos transformer decoder-only de Google: Gemma 3 1B para la variante ligera y Gemma 4 E2B para la variante mayor. El ajuste se realizó con LoRA sobre esas bases, con el objetivo de producir frases nominales adecuadas a cada área del expediente escolar a partir de palabras clave.

No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. El autor indica explícitamente que no se usaron expedientes reales con datos personales de alumnos en el entrenamiento, lo que es relevante desde el punto de vista de privacidad. Tampoco se detallan hiperparámetros del LoRA ni la técnica de fusión de adaptadores.

## Capacidades

- Generación de texto en coreano con registro administrativo-escolar y estilo nominal, adaptado a ocho áreas del expediente: comportamiento (행발), observaciones por asignatura (교과세특), autonomía (자율), clubes (동아리), orientación vocacional (진로), voluntariado (봉사), deporte escolar (스포츠클럽) y tutoría (학생상담).
- Interpretación de una plantilla de entrada concreta: `[영역/과목/약 N자] palabra_clave1, palabra_clave2, ...`, donde se indica el área, la asignatura y la longitud aproximada deseada.
- Control aproximado de longitud de la salida mediante la indicación de caracteres en la plantilla.
- Conversación básica (etiqueta `conversational`), aunque no es su función principal.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Redacción de observaciones de comportamiento: un docente introduce palabras clave como "responsabilidad, cumple sus tareas, respeta a los compañeros" y el modelo devuelve una frase nominal ajustada al área de comportamiento, lista para revisión.
- Observaciones por asignatura (교과세특): con la plantilla `[교과세특/수학/약 80자]`, el modelo genera descripciones breves del desempeño del alumno en una materia concreta.
- Registro de actividades de clubes y voluntariado: a partir de una lista de actividades realizadas, el modelo produce el texto descriptivo correspondiente al área de 동아리 o 봉사.
- Orientación vocacional: el docente aporta intereses y aptitudes del alumno y obtiene un borrador de la entrada de 진로, que después revisa y ajusta.
- Tutoría y seguimiento del alumno: borradores de notas de counselling (학생상담), con la advertencia explícita del autor de que el modelo puede malinterpretar la situación y que el texto requiere revisión docente obligatoria.
- Despliegue en equipos modestos: la variante de 1B en Q4_K_M (unos 0,8 GB) permite ejecución en CPU en equipos con 8 GB de RAM, útil en centros escolares sin GPU.
- Prototipado de asistentes internos para profesorado: integración de la variante GGUF en herramientas locales de escritorio para generar borradores que el docente edita antes de incorporarlos al sistema oficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: sgb-e2b-Q4_K_M ocupa unos 3,3 GB en disco y el autor recomienda 16 GB de RAM o un PC con tarjeta gráfica; sgb-1b-Q4_K_M ocupa unos 0,8 GB y funciona con 8 GB de RAM sin GPU.
- GPU recomendadas: no especificadas por el autor; por tamaño, la variante de 1B cabe en cualquier GPU consumer con 4 GB o más de VRAM, y la de 2B en GPUs con 6-8 GB de VRAM.
- Cabe en GPU consumer: sí, ambas variantes, en tarjetas tipo RTX 3060, RTX 4060 o superiores.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF; la etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| sgb-e2b-GGUF | 4.647.450.147 (declarado) | no disponible | ko | Apache 2.0 / Gemma Terms | GGUF |
| google/gemma-3-1b-it | 1B | no disponible en esta ficha | multilingüe | Gemma Terms of Use | safetensors, GGUF |
| google/gemma-4-E2B-it | no disponible | no disponible | multilingüe | Gemma Terms of Use | safetensors |

La comparación con las bases es la más pertinente: sgb-e2b es un ajuste de dominio sobre ellas, con mejor encaje en la tarea concreta de redacción de expedientes y peor rendimiento esperable en tareas generales. No se dispone de datos de benchmarks que permitan comparar calidad de forma cuantitativa.

## Limitaciones y advertencias

- El autor advierte que las frases generadas deben ser verificadas por el profesorado en cuanto a veracidad y expresión; en el área de tutoría el modelo puede malinterpretar la situación del alumno.
- Riesgo de alucinación relevante: puede inventar o distorsionar hechos sobre el alumno a partir de palabras clave ambiguas.
- Modelo monolingüe en la práctica (coreano); no se garantiza calidad en otros idiomas.
- Contexto máximo no documentado; no se recomienda para entradas largas.
- La licencia de la variante sgb-1b queda sujeta a los Gemma Terms of Use y a la política de usos prohibidos de Gemma, lo que condiciona el uso comercial.
- La discrepancia entre el recuento de parámetros declarado y las bases citadas impide confirmar el tamaño real del modelo.
- El repositorio no tiene descargas ni validación de la comunidad; no hay evidencia externa de calidad.
- Uso previsto limitado al ámbito educativo surcoreano; no es un modelo de propósito general.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ssunzoon/sgb-e2b-GGUF
- Modelo base Gemma 4 E2B: https://huggingface.co/google/gemma-4-E2B-it
- Modelo base Gemma 3 1B: https://huggingface.co/google/gemma-3-1b-it
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
- Política de usos prohibidos de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
