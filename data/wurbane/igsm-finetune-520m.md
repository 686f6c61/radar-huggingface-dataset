# WUrbane/igsm-finetune-520m

## Resumen

`WUrbane/igsm-finetune-520m` es un repositorio de modelos de lenguaje de tipo causal (arquitectura transformer, librería `transformers`) publicados por el usuario WUrbane. No se trata de un modelo único, sino de una colección de cuatro subcarpetas, cada una de las cuales contiene un modelo completo de aproximadamente 520 millones de parámetros, obtenido mediante fine-tuning a partir de un modelo base preentrenado del proyecto `OptimizerStudy` (variantes `adamw_*` y `muon_*`). El sufijo "520m" del identificador apunta a ese orden de magnitud de parámetros, aunque el tamaño exacto no está documentado en la información disponible.

El propósito declarado en la model card es un estudio comparativo de optimizadores durante el fine-tuning: cada submodelo combina un preentrenamiento con AdamW o Muon y un fine-tuning posterior con AdamW o Muon, con tasas de aprendizaje distintas (3e-5, 1e-3, 1e-5 y 3e-4) y un mismo presupuesto de 682 pasos de entrenamiento. Todos comparten una semilla/rotación identificada como `k0 / 20261023` y se entrenaron en hardware A100 con precisión matmul `tf32`. El repositorio ocupa 12,8 GB en total.

Se trata de un artefacto de investigación más que de un modelo listo para producción: no hay pipeline declarado, no se especifican licencia, idiomas ni datos de entrenamiento, y no consta ningún benchmark publicado. Su interés para desarrolladores e investigadores radica en la posibilidad de reproducir y comparar el efecto de distintos optimizadores y learning rates sobre un mismo base model, así como de inspeccionar los hiperparámetros y hashes incluidos en los ficheros `EXPORT.json` de cada subcarpeta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (AutoModelForCausalLM), detalles no disponibles |
| Parametros totales | Aproximadamente 520M (según el nombre del repositorio; cifra exacta no disponible) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

Cada submodelo es un modelo causal estándar cargable con `AutoModelForCausalLM`, derivado de un base model preentrenado del proyecto `OptimizerStudy` (ramas `adamw_*` o `muon_*`). El fine-tuning se realizó durante 682 pasos con dos optimizadores cruzados: los modelos con etiqueta `A` parten de un base preentrenado con AdamW y los etiquetados `M` parten de uno preentrenado con Muon; a su vez, el fine-tuning se ejecutó con AdamW o Muon según la variante. Las learning rates principales fueron 3e-5 y 1e-5 para las variantes AdamW y 1e-3 y 3e-4 para las variantes Muon. Todos los entrenamientos usaron precisión matmul `tf32` en GPUs A100 y comparten la rotación/semilla `k0 / 20261023`.

Cada subcarpeta incluye un `EXPORT.json` con hiperparámetros, hashes y referencia al modelo base, lo que permite auditar la configuración exacta de cada ejecución. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF, DPO o instrucción tuning. El nombre "igsm" y la referencia a "order seed 20261023 blocks" sugieren un experimento de estudio de optimizadores más que un entrenamiento orientado a capacidades generales.

## Capacidades

- Generación de texto autorregresiva como modelo causal (`AutoModelForCausalLM`).
- Fine-tuning sobre un base model preentrenado; no hay evidencia documentada de capacidades específicas de instrucción, razonamiento o código.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Trazabilidad experimental: cada submodelo expone hiperparámetros, hashes y base model en `EXPORT.json`, lo que facilita reproducibilidad y comparación entre optimizadores.

## Casos de uso

- Estudio comparativo de optimizadores: usar las cuatro variantes (AdamW/AdamW, AdamW/Muon, Muon/AdamW, Muon/Muon) para medir el impacto del optimizador de preentrenamiento y de fine-tuning sobre una misma tarea y presupuesto de 682 pasos, manteniendo constante la semilla `k0 / 20261023`.
- Reproducción de experimentos de fine-tuning: cargar cada subcarpeta con `subfolder=` en `from_pretrained` y reutilizar los hiperparámetros registrados en `EXPORT.json` para replicar o extender el entrenamiento en A100 con `tf32`.
- Investigación sobre learning rates: comparar las cuatro tasas documentadas (3e-5, 1e-3, 1e-5, 3e-4) para analizar sensibilidad del fine-tuning a la LR en modelos de ~520M.
- Base para fine-tuning adicional específico de dominio: al ser modelos causales de tamaño medio, pueden servir como punto de partida para adaptaciones posteriores en tareas concretas, siempre que se verifique la licencia del base model original.
- Experimentación académica en eficiencia de entrenamiento: al ser modelos pequeños (~520M) y entrenados en A100, permiten iterar rápidamente sobre hipótesis de optimización sin grandes presupuestos de cómputo.
- Auditoría de artefactos de investigación: inspeccionar hashes y metadatos de `EXPORT.json` para verificar integridad y procedencia de cada checkpoint antes de reutilizarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de ~520M en fp16/bf16 el orden de magnitud habitual es de ~1-2 GB de pesos, pero esta cifra no está confirmada por el autor.
- GPU recomendadas: no disponibles; el autor documenta A100 únicamente como hardware de entrenamiento (con `tf32`).
- Compatibilidad con GPU de consumo: no confirmada; por tamaño nominal (~520M) sería plausible en GPUs consumer, pero no hay datos oficiales.
- Opciones de despliegue: carga mediante `transformers` (`AutoModelForCausalLM`, `AutoTokenizer`) con `subfolder=`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica modelos comparables de la misma categoría (estudios de optimizadores sobre base models de ~520M) ni ofrece métricas que permitan una comparación objetiva.

## Limitaciones y advertencias

- Licencia no declarada: no es posible determinar si se permite uso comercial; debe consultarse el base model original (`OptimizerStudy/adamw_*` o `OptimizerStudy/muon_*`) antes de cualquier uso en producción.
- Idiomas y dominio de entrenamiento no documentados: riesgo alto de comportamiento impredecible fuera del dominio experimental.
- Sin benchmarks publicados: no hay evidencia de calidad, razonamiento, código ni robustez.
- Riesgo de alucinación: inherente a modelos causales sin etapa de alineación documentada; no se indica RLHF/DPO.
- Contexto máximo desconocido: no se puede planificar su uso en tareas de contexto largo.
- Artefacto de investigación: pensado para comparar optimizadores, no como modelo listo para producto; el pipeline no está declarado.
- Repositorio de 12,8 GB con cuatro submodelos: la descarga completa es pesada; conviene clonar solo la subcarpeta de interés.
- Fechas de creación/actualización anómalas (2026): conviene verificar la procedencia y los hashes de `EXPORT.json` antes de reutilizar los pesos.

## Enlaces

- Hugging Face: https://huggingface.co/WUrbane/igsm-finetune-520m
- Base models referenciados en la model card: `OptimizerStudy/adamw_*` y `OptimizerStudy/muon_*` (no se proporcionan URLs directas en la información disponible)
- Paper, blog, repositorio o demo adicionales: no disponibles
