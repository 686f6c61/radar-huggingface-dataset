# WangLXatDut/Qwen3.5-2B-CHD-CPT

## Resumen

Qwen3.5-2B-CHD-CPT es un checkpoint de investigación publicado por el usuario WangLXatDut en Hugging Face. Se trata de un ajuste por preentrenamiento continuado (continued pretraining) sobre Qwen3.5-2B-Base, realizado con una mezcla de textos médicos centrados en cardiopatía coronaria (coronary heart disease, CHD), directrices clínicas, información de medicamentos y texto general en chino. El modelo conserva la arquitectura y el tamaño del modelo base, con 1.881.825.088 parámetros totales según los pesos en safetensors.

El objetivo declarado es adaptar un modelo de lenguaje generalista de 2B parámetros al dominio cardiológico mediante exposición adicional a literatura especializada, en lugar de mediante ajuste supervisado o alineación por preferencias. El autor lo presenta explícitamente como un artefacto de investigación: el entrenamiento consistió en una única época de preentrenamiento continuado (6.620 pasos) finalizada el 18 de noviembre de 2026, con una pérdida de validación final de 1,4303.

La relevancia de esta ficha es doble. Por un lado, documenta un caso típico de adaptación de dominio de bajo coste sobre un modelo pequeño. Por otro, y de forma más importante, el propio autor advierte de que en la evaluación múltiple CDE18 de 393 preguntas el modelo CPT y el modelo base respondieron correctamente 206 preguntas cada uno, es decir, no se observó mejora medible. Cualquier uso en producción clínica debe descartarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tag `qwen3_5_text`) |
| Parametros totales | 1.881.825.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (entrenamiento con longitud de secuencia 2.048) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, sin GGUF en el repo) |
| Idiomas soportados | chino e ingles en los datos de entrenamiento; soporte oficial no declarado |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 7,5 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Fecha de creacion | 2026-11-20 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3.5, en su variante de texto (`qwen3_5_text`), con aproximadamente 1,88 mil millones de parámetros. No se documentan modificaciones arquitectónicas respecto al modelo base: el trabajo consiste íntegramente en preentrenamiento continuado, es decir, se sigue entrenando el modelo base con el objetivo de modelado de lenguaje sobre un corpus nuevo, sin cambiar la topología de la red.

El entrenamiento se realizó a longitud de secuencia 2.048, con tasa de aprendizaje 1e-5, optimizador Adafactor y precisión BF16, durante una época completa (6.620 pasos). El corpus combinó texto cardiológico sobre enfermedad coronaria, resúmenes y guías clínicas, información de medicamentos y texto general en chino, con presencia también de inglés. La pérdida de validación final sobre el conjunto de validación del propio entrenamiento fue de 1,4303. No se indica en la información disponible si hubo fases posteriores de ajuste supervisado, RLHF o DPO, ni se detalla el volumen total de tokens de entrenamiento.

La innovación técnica, en la medida en que existe, es metodológica: adaptación de dominio por continuación de preentrenamiento sobre un modelo pequeño, un enfoque barato y reproducible que evita el coste de entrenar desde cero. El autor no reporta técnicas adicionales como decodificación especulativa, atención lineal ni variantes híbridas.

## Capacidades

- Generación de texto conversacional en chino e inglés, heredada del modelo base Qwen3.5-2B-Base.
- Exposición a vocabulario y registro del dominio cardiológico: terminología de enfermedad coronaria, guías clínicas y farmacología.
- Modelado de lenguaje general: el preentrenamiento continuado no elimina las capacidades del modelo base, aunque puede degradarlas parcialmente.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No se documenta modo de razonamiento (thinking mode), visión, audio ni otras modalidades.
- Capacidades multilingües limitadas a lo observado en los datos (chino e inglés); no hay evaluación de idiomas.

## Casos de uso

- Exploración de adaptación de dominio en investigación: el checkpoint sirve como referencia reproducible para estudiar si el preentrenamiento continuado sobre corpus cardiológico mejora tareas posteriores, comparándolo siempre contra Qwen3.5-2B-Base con el mismo protocolo de evaluación.
- Generación de borradores de texto divulgativo cardiológico: puede producir explicaciones preliminares sobre enfermedad coronaria que un especialista revisaría y corregiría antes de cualquier uso.
- Prototipado de asistentes de formación médica: útil para construir demos de bajo coste en un entorno controlado, con validación humana obligatoria y sin exposición a pacientes.
- Investigación en evaluación clínica de LLM: el resultado del CDE18 (206/393 en ambos modelos) constituye un punto de partida para diseñar evaluaciones más sensibles a tareas post-PCI.
- Experimentos de ajuste fino posteriores: al ser un checkpoint de 2B parámetros, cabe en una GPU de consumo para SFT o DPO sobre datos clínicos etiquetados, como paso previo a una validación formal.
- Estudio de olvido catastrófico y deriva de dominio: permite medir cuánto se degradan capacidades generales tras una época de preentrenamiento continuado sobre un corpus estrecho.
- Generación aumentada con recuperación (RAG) sobre guías clínicas: el modelo puede integrarse como generador en un pipeline donde la evidencia provenga de documentos recuperados y citados, reduciendo el peso de su conocimiento paramétrico.

## Benchmarks y rendimiento

| Evaluacion | Qwen3.5-2B-CHD-CPT | Qwen3.5-2B-Base |
|---|---|---|
| CDE18, 393 preguntas de opcion multiple (aciertos) | 206 | 206 |
| Perdida de validacion (conjunto del entrenamiento) | 1,4303 | no disponible |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor advierte que la evaluación CDE18 no cubre el espectro completo de tareas clínicas post-PCI y que no se ha establecido un beneficio clínico estable.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 3,8 GB solo para pesos (1,88B parámetros × 2 bytes), más caché KV y activaciones; en la práctica, entre 5 y 7 GB según longitud de contexto y lote.
- VRAM estimada en FP16: idéntica a BF16 en orden de magnitud (unos 3,8 GB de pesos).
- Cuantización a 8 bits: alrededor de 2 GB de pesos; a 4 bits, alrededor de 1 GB, aunque no se distribuyen pesos GGUF en el repositorio y habría que convertirlos.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM para BF16 con contexto moderado; A100, H100 o L40S para despliegue con concurrencia.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, así como en GPUs con 8 GB si se limita el contexto o se cuantiza.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI para servicio con throughput, llama.cpp u Ollama tras conversión a GGUF (no incluida en el repo).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-2B-CHD-CPT | 1,88B | no disponible | no disponible | safetensors | Checkpoint de investigación, sin mejora medida en CDE18 |
| Qwen3.5-2B-Base | ~2B | no disponible | no disponible | safetensors | Modelo base; mismo resultado en CDE18 (206/393) |
| Modelos médicos abiertos de ~2-7B (p. ej. variantes de la familia Meditron, BioMistral o Qwen medical) | 2B-7B | variable | variable | safetensors, GGUF | No se dispone de datos verificados en la información proporcionada para una comparación numérica |

No se dispone de resultados de benchmarks comparativos verificados en la información proporcionada; la única comparación numérica fiable es la del CDE18 frente al modelo base, con empate a 206 aciertos.

## Limitaciones y advertencias

- No es un modelo clínicamente validado: el propio autor lo califica de checkpoint de investigación y descarta cualquier uso asistencial sin validación formal.
- No se ha demostrado beneficio en tareas clínicas: en CDE18, CPT y base obtienen 206/393; la evaluación no cubre tareas post-PCI.
- Licencia no disponible: la ausencia de licencia explícita impide asumir permisos de uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Riesgo de alucinación: un modelo de 2B parámetros sin alineación declarada puede generar afirmaciones médicas plausibles pero incorrectas, especialmente en dosis, interacciones y contraindicaciones.
- Sesgos desconocidos: no se documenta composición detallada del corpus ni procesos de filtrado, por lo que no pueden evaluarse sesgos de dominio, geográficos o de población.
- Idiomas: solo chino e inglés en los datos; no hay evaluación de calidad por idioma ni soporte declarado de castellano.
- Deriva de dominio: una época de preentrenamiento continuado sobre un corpus estrecho puede degradar capacidades generales (olvido catastrófico); no se reportan evaluaciones de retención.
- Contexto de entrenamiento de 2.048 tokens: no se especifica la ventana de inferencia efectiva, lo que limita el uso con documentos largos.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin revisión comunitaria ni validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WangLXatDut/Qwen3.5-2B-CHD-CPT
- Modelo base de referencia (Qwen3.5-2B-Base): no disponible en la información proporcionada
- Paper o blog técnico del autor: no disponible
- Repositorio de código: no disponible
- Demo o espacio interactivo: no disponible
