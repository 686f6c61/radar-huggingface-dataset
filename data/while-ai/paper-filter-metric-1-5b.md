# while-ai/paper-filter-metric-1.5b

## Resumen

paper-filter-metric-1.5b es un adaptador LoRA publicado por while-ai sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. No es un modelo de propósito general, sino el artefacto experimental de una receta de replicación de un paper: se entrena con GRPO sobre el dataset GSM8K y su objetivo es aislar el efecto del filtro de muestreo dinámico (dynamic sampling) al estilo de DAPO durante el aprendizaje por refuerzo.

La pregunta que aborda es concreta. Al filtrar los grupos de respuestas con recompensa homogénea, ¿conviene mirar la recompensa moldeada con componente de longitud o el resultado binario correcto/incorrecto? Filtrar por la puntuación moldeada mantiene vivos grupos en los que todas las respuestas fallan y convierte las migajas de longitud en ventajas de tamaño completo; filtrar por el resultado binario los descarta. Con 40 pasos de entrenamiento, el brazo de la receta alcanza un pass@1 de 0,46 frente a 0,39 del brazo de control y 0,36 sin entrenamiento.

Su relevancia actual es metodológica: publica los dos brazos (receta y baseline) para inspección, junto con el script de reproducción, y el propio autor califica el veredicto como "unresolved" hasta disponer de una segunda semilla por brazo. Es material de investigación reproducible, no un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only Qwen2.5; la configuración del adaptador (rango, alpha, módulos objetivo) no está publicada |
| Parametros totales | No disponible para el adaptador; el modelo base Qwen/Qwen2.5-1.5B-Instruct tiene 1,5 mil millones de parámetros y el repositorio del adaptador ocupa 0,3 GB |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; se hereda del modelo base Qwen/Qwen2.5-1.5B-Instruct |
| Tipos de cuantizacion | No disponible: solo se publican los pesos del adaptador LoRA en safetensors; no hay versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible: la model card no declara idiomas y los datos de entrenamiento (GSM8K) son problemas matemáticos en inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, `library_name: peft`); la carpeta `checkpoints/` no se distribuye |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Dataset de entrenamiento | openai/gsm8k |
| Algoritmo | GRPO con recompensa moldeada por longitud y filtro de grupo por resultado binario |
| Pasos de entrenamiento | 40 por brazo |
| Brazos publicados | Raíz: filtro sobre resultado binario (receta, ejecución del 17-09-2026). Subcarpeta `baseline`: filtro sobre puntuación moldeada |
| Descargas y likes | 0 descargas, 0 likes en el momento de la consulta |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con GRPO (Group Relative Policy Optimization) sobre Qwen/Qwen2.5-1.5B-Instruct, usando exclusivamente el dataset GSM8K de problemas aritméticos de varios pasos. La innovación que se estudia no está en la arquitectura, sino en la función de filtrado de grupos: la recompensa es moldeada por longitud, y el criterio de descarte de grupos con recompensa idéntica puede leerse sobre esa puntuación moldeada o sobre el resultado binario final. El autor defiende que filtrar por el resultado es lo que significa el muestreo dinámico de DAPO, porque evita conservar grupos en los que todas las respuestas fallan y evita convertir señales residuales de longitud en ventajas artificiales.

El experimento compara dos brazos con idéntico presupuesto de pasos (40) y evalúa sobre 120 tareas emparejadas. El brazo de la receta consumió 21,8 minutos de GPU frente a los 30,0 del brazo de control, y su delta de pass@1 es de +0,067 [+0,021, +0,113] respecto al baseline, un intervalo que excluye el cero y que supera la banda de re-ejecución de la evaluación (0,025, medida con diez re-ejecuciones del modelo base). Un detalle relevante: la puntuación moldeada bajó mientras el pass@1 subía, lo contrario de un patrón de sobreoptimización. No hay información publicada sobre composición adicional del dataset, RLHF, DPO ni técnicas de decodificación especulativa en este adaptador.

## Capacidades

- Generación de texto conversacional: etiquetas `text-generation` y `conversational` heredadas del modelo base.
- Razonamiento matemático de varios pasos sobre problemas tipo GSM8K: pass@1 de 0,46 en la evaluación publicada.
- Generación de cadenas de solución paso a paso (el entrenamiento se realiza sobre soluciones de GSM8K).
- Instrucciones generales: al ser un adaptador sobre Qwen2.5-1.5B-Instruct, conserva las capacidades del base, aunque la model card no las evalúa.
- Tool calling / function calling: no documentado en este adaptador.
- Soporte de agentes y razonamiento multi-paso fuera de matemáticas: no documentado.
- Capacidades multilingües: no documentadas; los datos de entrenamiento están en inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Reproducción de experimentos de RL: el repositorio incluye el script `recipe.py` y las versiones de librerías fijadas, de modo que un grupo de investigación puede reejecutar los dos brazos con semilla, GPU y pasos de entrenamiento idénticos.
- Estudio de filtros de muestreo dinámico: sirve como caso controlado para medir el efecto de filtrar por recompensa moldeada frente a filtrar por resultado binario, con una diferencia cuantificada de +0,067 en pass@1 sobre 120 tareas emparejadas.
- Investigación sobre reward shaping: al separar la señal de longitud del resultado final, permite analizar cómo las recompensas auxiliares deforman las ventajas dentro de un grupo GRPO.
- Punto de partida para fine-tuning adicional: el adaptador se carga con `peft` sobre el base y puede servir como inicialización barata para experimentos de razonamiento matemático en dominios cercanos.
- Docencia y formación en RL aplicado: con 40 pasos de entrenamiento y menos de una hora de GPU por brazo, es un banco de pruebas asequible para explicar GRPO y el filtrado de grupos con resultados medibles.
- Evaluación comparativa de adaptadores: el repositorio publica el brazo de control en la subcarpeta `baseline`, lo que permite comparar dos configuraciones de entrenamiento bajo la misma base y el mismo presupuesto.
- Generación de soluciones aritméticas asistidas: uso experimental para producir soluciones paso a paso de problemas de nivel escolar en inglés, asumiendo la tasa de acierto publicada del 46 % y sin garantías de producción.

## Benchmarks y rendimiento

Datos publicados en la model card, sobre evaluaciones de GSM8K con 120 tareas emparejadas:

| Brazo | pass@1 | IC 95 % | pass@k | Pasos | Minutos de GPU |
|---|---|---|---|---|---|
| Base, sin entrenamiento | 0,36 | [0,29, 0,43] | 0,57 | 0 | 0 |
| Baseline (filtro sobre puntuación moldeada) | 0,39 | [0,33, 0,45] | 0,68 | 40 | 30,0 |
| Receta (filtro sobre resultado binario) | 0,46 | [0,39, 0,53] | 0,70 | 40 | 21,8 |

Diferencia receta frente a baseline: +0,067 [+0,021, +0,113]. La banda de re-ejecución de la evaluación es de 0,025 (diez re-ejecuciones del modelo base). El autor marca el veredicto como "unresolved" hasta contar con una segunda semilla de entrenamiento por brazo. No se han publicado resultados de MMLU, HumanEval ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir del tamaño del base, no publicada por el autor): en torno a 1 GB para los pesos del modelo base en cuantización de 4 bits, unos 1,6 GB en int8 y unos 3 GB en fp16, más caché KV y activaciones; el adaptador en sí ocupa 0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM. Cabe sin problema en tarjetas de consumo como RTX 3060, RTX 4060 Ti o RTX 4090. Para entrenamiento, la receta consume entre 21,8 y 30,0 minutos de GPU por brazo de 40 pasos, aunque el modelo de GPU empleado no se especifica en la ficha.
- Opciones de despliegue: `transformers` + `peft` es la vía documentada en la model card; vLLM y TGI admiten adaptadores LoRA; para llama.cpp u Ollama es necesario fusionar previamente el adaptador con el modelo base y convertir el resultado a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K pass@1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| while-ai/paper-filter-metric-1.5b (receta) | 1,5 B (base) + LoRA | No disponible | 0,46 | apache-2.0 | Adaptador LoRA en HuggingFace |
| while-ai/paper-filter-metric-1.5b (brazo `baseline`) | 1,5 B (base) + LoRA | No disponible | 0,39 | apache-2.0 | Subcarpeta del mismo repositorio |
| Qwen/Qwen2.5-1.5B-Instruct sin entrenar | 1,5 B | No disponible en la información aportada | 0,36 | No disponible en la información aportada | Pesos completos en HuggingFace |
| Modelos de razonamiento de ~1,5 B de la familia DeepSeek-R1-Distill u OpenMath | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación directa solo es posible, con los datos aportados, entre los tres brazos del mismo experimento. Para alternativas externas de tamaño similar no hay cifras verificables en la información disponible.

## Limitaciones y advertencias

- Veredicto científico abierto: el propio autor etiqueta el resultado como "unresolved" porque solo existe una semilla de entrenamiento por brazo.
- El intervalo de confianza del delta (+0,021 a +0,113) es amplio y la evaluación se apoya en 120 tareas emparejadas, no en el conjunto completo de GSM8K.
- Entrenamiento y evaluación sobre GSM8K: al ser un benchmark público muy extendido, existe riesgo de contaminación y de que las cifras no generalicen a otros conjuntos de problemas.
- Ámbito limitado a razonamiento aritmético de varios pasos; no hay evaluación de tool calling, agentes, código ni tareas abiertas.
- Idiomas: la model card no declara idiomas soportados y los datos de entrenamiento están en inglés, por lo que el comportamiento en castellano no está verificado.
- Sesgos y alineación: no hay información sobre evaluación de sesgos o seguridad; el adaptador hereda las características del modelo base sin filtros adicionales documentados.
- Riesgo de alucinación: es un modelo de 1,5 B con pass@1 de 0,46 en su propia tarea; en producción generaría soluciones incorrectas con frecuencia apreciable.
- Licencia: el adaptador se publica bajo apache-2.0, pero conviene verificar la licencia del modelo base antes de un uso comercial.
- Distribución incompleta: no se publican checkpoints intermedios ni versiones cuantizadas, y el uso requiere descargar por separado el modelo base.
- Advertencia del autor: la model card recomienda leer la sección "Learned" del repositorio antes de citar cualquier cifra.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/while-ai/paper-filter-metric-1.5b
- Receta y script de reproducción: https://github.com/whilehq/whileai-sdk/tree/main/recipes/papers/filter-metric
- Colección "Papers, replicated": https://huggingface.co/collections/while-ai/papers-replicated-6ab271de22542eb550d4251c
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset: https://huggingface.co/datasets/openai/gsm8k
- Nota sobre la búsqueda web: las consultas realizadas no devolvieron resultados relevantes sobre este modelo (únicamente traducciones y definiciones del término inglés "while"), por lo que no hay papers, blogs ni demos adicionales que enlazar.
