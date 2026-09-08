# ToastyPigeon/gemma-4-12b-full-cpt

## Resumen

El modelo `ToastyPigeon/gemma-4-12b-full-cpt` es un adaptador LoRA de preentrenamiento continuado (CPT) sobre el modelo base `google/gemma-4-12b` (versión base, no instructiva), desarrollado por ToastyPigeon. Está especializado en prosa narrativa y estilos de ficción, y se presenta como punto de partida para ajustes posteriores en juegos de rol o estilos. Se entrenó entre el 29 de agosto y el 1 de septiembre de 2026, con 1740 pasos, sobre una mezcla de corpus de prosa y registros de chat que incluye contenido adulto y erótico.

El modelo base es un transformer decoder-only de 12 mil millones de parámetros, y el adaptador se entrenó con una ventana de contexto de 8192 tokens. El repositorio contiene únicamente los pesos del adaptador LoRA (0.9 GB en safetensors), no el modelo completo, por lo que requiere el modelo base para su uso. Al ser un adaptador CPT, no es un modelo instructivo ni conversacional: su comportamiento esperado es el de autocompletado de texto.

La relevancia del modelo radica en su especialización en prosa literaria y su disponibilidad como adaptador QLoRA, lo que permite experimentar con estilos narrativos sin entrenar un modelo completo desde cero. No obstante, su contenido incluye material adulto, por lo que el autor lo destina exclusivamente a investigación por adultos y advierte que no debe usarse en producción ni por menores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma-4-12B) con adaptador LoRA |
| Parámetros totales | No disponible (adaptador LoRA; modelo base: 12B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (ventana de entrenamiento del adaptador) |
| Tipos de cuantización | No disponible (entrenado con QLoRA 4-bit NF4; adaptador en bf16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de preentrenamiento continuado (CPT) sobre el transformer decoder-only `google/gemma-4-12b`. El entrenamiento se realizó con QLoRA: el cuerpo del modelo base se mantuvo congelado en 4-bit NF4, mientras que los adaptadores LoRA se entrenaron en bf16 con r=64, alpha=64 y dropout 0.05 (sin dropout en inferencia). Las proyecciones objetivo son q, k, v, o, gate, up y down, aplicándose únicamente a las capas SWA (`swa_only: true`). Los embeddings y la cabeza de salida están atados y congelados.

El entrenamiento se llevó a cabo durante 1740 pasos de optimizador, con una longitud de secuencia de 8192 tokens (empaquetado sin solapamiento, con stride igual a la longitud de secuencia) y barajado previo al empaquetado. Se usó DDP en 2 GPUs de 24 GB, con micro-batch 1, grad_accum 8 y batch efectivo 16. La función de pérdida fue `cut_cross_entropy`, respetando el `final_logit_softcapping = 30.0` de Gemma. El learning rate fue 5e-05 para los LoRA, con 5% de warmup, programación coseno, weight decay 0 y grad clip 1.0. La pérdida media descendió de 2.42 (primeros 100 pasos) a 2.25 (últimos 100 pasos).

Los datos de entrenamiento son una mezcla de corpus de prosa y registros de chat, incluyendo conjuntos públicos del propio autor (`erotic-books-clone`, `new-story-dataset`, `some-erotica`, `steve-and-marvin`, `SpringDragon-chat`, `disco-chat`, `counter-signal`) y dos conjuntos privados centrados en contenido WLW y chat. No se menciona ningún proceso de RLHF ni DPO; se trata de un preentrenamiento continuado clásico.

## Capacidades

- Generación de texto en modo autocompletado (raw completion) sobre el modelo base Gemma-4-12B.
- Especialización en prosa narrativa y estilo de ficción, según los datos de entrenamiento.
- Punto de partida para apilar o fusionar el adaptador en ajustes posteriores de juego de rol o estilo.
- Soporte de contexto largo de hasta 8192 tokens, útil para generación de historias extensas.
- No se documentan capacidades de tool calling, function calling, agentes, visión ni audio.
- No es un modelo instructivo ni conversacional: no sigue instrucciones ni mantiene diálogos de forma nativa.

## Casos de uso

- Experimentos de escritura de ficción: el adaptador puede utilizarse sobre el modelo base para generar prosa continua en modo autocompletado, permitiendo explorar estilos narrativos y variaciones de tono.
- Investigación en estilos literarios: al estar entrenado en una mezcla de prosa y registros de chat, resulta útil para estudiar cómo el preentrenamiento continuado modifica el estilo de un modelo base.
- Punto de partida para ajustes de juego de rol: el autor lo presenta explícitamente como base para apilar o fusionar adaptadores en tareas de juego de rol o ajuste de estilo.
- Prototipado de modelos de chat no instructivos: sirve como base para experimentar con la generación de texto libre antes de aplicar un ajuste instructivo.
- Análisis de contenido adulto en modelos de lenguaje: al incluir material erótico en el entrenamiento, puede usarse para investigar sesgos y comportamientos en este tipo de contenido, siempre en contextos de investigación.
- Experimentación con contextos largos: la ventana de 8192 tokens permite probar la generación de narrativas extensas y evaluar la coherencia a lo largo de secuencias largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Solo se conoce la evolución de la pérdida de entrenamiento: media de 2.42 en los primeros 100 pasos y 2.25 en los últimos 100 pasos, sin comparaciones con otros modelos.

## Requisitos de hardware

- El entrenamiento se realizó con 2 GPUs de 24 GB cada una (DDP), con micro-batch 1 y grad_accum 8.
- Para inferencia, al ser un adaptador LoRA, es necesario cargar el modelo base `google/gemma-4-12b` además del adaptador. El adaptador ocupa 0.9 GB.
- VRAM estimada: en bf16, el modelo base de 12B requiere aproximadamente 24 GB; con cuantización QLoRA (4-bit), puede reducirse a unos 8-10 GB. Estas cifras son estimaciones basadas en el tamaño del modelo, no datos publicados.
- GPU recomendada: una GPU con al menos 24 GB de VRAM para cargar el modelo en bf16 (por ejemplo, RTX 4090, A100 40GB, H100). Para cuantización, una GPU de 16 GB podría ser suficiente.
- Opciones de despliegue: al ser un adaptador PEFT, puede integrarse con bibliotecas como vLLM, llama.cpp o Transformers/PEFT para inferencia. No se especifican configuraciones concretas en la documentación.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El autor tiene otros adaptadores sobre el mismo modelo base (`ToastyPigeon/gemma-4-12b-marvin-v1` y `ToastyPigeon/gemma-4-12b-marvin-v2`), pero no se han publicado especificaciones ni resultados de benchmarks para ninguno de ellos. Por tanto, no se puede realizar una comparación cuantitativa. El modelo base `google/gemma-4-12b` es el punto de referencia, pero el adaptador no aporta datos de rendimiento propios.

## Limitaciones y advertencias

- Contenido adulto: los datos de entrenamiento incluyen ficción erótica y contenido WLW. El autor indica que no debe usarse en producción ni por menores.
- No es un modelo instructivo: el adaptador es de preentrenamiento continuado, por lo que su comportamiento esperado es de autocompletado, no de conversación ni seguimiento de instrucciones.
- Licencia no disponible: no se especifica la licencia del adaptador, lo que genera incertidumbre para su uso comercial.
- Sin benchmarks publicados: no hay evaluaciones de rendimiento, sesgos ni alucinaciones.
- Dependencia del modelo base: el adaptador por sí solo no es un modelo completo; requiere `google/gemma-4-12b` para funcionar.
- Idiomas no especificados: no se documentan los idiomas soportados, aunque el modelo base Gemma es multilingüe.
- Riesgo de alucinación: al ser un modelo de lenguaje generativo, puede producir contenido falso o incoherente, especialmente en modo autocompletado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ToastyPigeon/gemma-4-12b-full-cpt
- Modelo base: https://huggingface.co/google/gemma-4-12b
- Adaptadores relacionados del autor: https://huggingface.co/ToastyPigeon/gemma-4-12b-marvin-v1
- Adaptadores relacionados del autor: https://huggingface.co/ToastyPigeon/gemma-4-12b-marvin-v2
