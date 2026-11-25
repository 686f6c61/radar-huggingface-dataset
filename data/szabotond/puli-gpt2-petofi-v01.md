# SzaBotond/puli-gpt2-petofi-v01

## Resumen

PULI-GPT-2 Petőfi es un ajuste fino (fine-tuning) del modelo base NYTK/PULI-GPT-2, un GPT-2 de aproximadamente 345 millones de parámetros entrenado para el húngaro por el equipo NYTK (Yang et al., MSZNY 2023). El autor, SzaBotond, lo ha reentrenado sobre el corpus poético de Sándor Petőfi, uno de los poetas nacionales húngaros del siglo XIX, con el objetivo de generar poemas en su estilo. Se trata de un proyecto personal de experimentación, no de un modelo de producción.

El modelo conserva la arquitectura transformer decoder-only de GPT-2 y añade 354.609.152 parámetros en formato safetensors (1,4 GB de repositorio). Su única lengua soportada es el húngaro y su licencia es CC-BY-4.0, lo que permite uso comercial con atribución. Es relevante como ejemplo de adaptación de bajo coste de un modelo base pequeño a un dominio literario muy específico, y resulta útil para quien quiera experimentar con generación creativa en húngaro sin infraestructura pesada.

No hay datos publicados de benchmarks ni de evaluación cuantitativa; el autor reconoce explícitamente que el resultado "está lejos de ser perfecto" y que solo ocasionalmente produce poemas convincentes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2) |
| Parametros totales | 354.609.152 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de 256 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantización estándar de transformers) |
| Idiomas soportados | húngaro (hu) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un GPT-2 estándar de tipo decoder-only, heredado de NYTK/PULI-GPT-2, que a su vez es un GPT-2 entrenado específicamente para húngaro por el equipo NYTK. No incorpora innovaciones arquitectónicas: no hay mezcla de expertos, atención lineal ni decodificación especulativa. El ajuste fino se realizó sobre poemas de Petőfi Sándor, con un entrenamiento local en PyTorch limitado por el hardware del autor.

Los hiperparámetros documentados son: 5 épocas con parada temprana, batch size 2 con acumulación de gradientes de 4 (batch efectivo 8), learning rate 3e-5, weight decay 0,01, longitud máxima de secuencia de 256 tokens, precisión mixta FP16 y gradient checkpointing. No se especifica el número de tokens de entrenamiento, la composición exacta del corpus ni si hubo etapas de RLHF o DPO; por el tipo de proyecto, es razonable asumir que se trata de un ajuste supervisado puro, pero este dato no está confirmado en la información disponible.

## Capacidades

- Generación de texto en húngaro con estilo poético inspirado en Petőfi.
- Continuación de versos y estrofas a partir de un prompt (por ejemplo, "A pusztán fúj a szél,").
- Generación creativa con control de temperatura, top-k, top-p, repetition penalty y no-repeat n-gram.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multimodales (ni visión ni audio).
- No dispone de modo "thinking" ni de razonamiento explícito.
- Capacidad multilingüe limitada al húngaro; no se ha evaluado su comportamiento en otras lenguas.

## Casos de uso

- Generación de poesía en húngaro con estilo clásico: el modelo continúa versos y estrofas a partir de un prompt, útil para talleres literarios, experimentación creativa o generación de borradores que un poeta humano revise después.
- Prototipado de aplicaciones de escritura creativa en húngaro: al ser un modelo de 354 M de parámetros, se puede desplegar en un portátil o en una GPU de gama media para demos interactivas de generación de texto literario.
- Investigación sobre ajuste fino de dominio: sirve como caso de estudio reproducible de cómo adaptar un GPT-2 pequeño a un corpus literario con recursos limitados (5 épocas, batch efectivo 8, FP16).
- Educación y divulgación sobre modelos de lenguaje: permite explicar el funcionamiento de un transformer generativo y el efecto de los hiperparámetros de muestreo con un modelo ligero y rápido de ejecutar.
- Generación de variaciones estilísticas: combinando temperatura y top-p se pueden producir desde continuaciones conservadoras hasta variaciones más libres, útil para explorar el espacio creativo de un autor concreto.
- Experimentos de evaluación de estilo literario: investigadores pueden usar el modelo como baseline para medir hasta qué punto un modelo pequeño captura el estilo de un autor frente a modelos mayores ajustados con el mismo corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0,7 GB solo para los pesos (354 M de parámetros), más overhead de activaciones y caché KV; en la práctica, menos de 2 GB.
- VRAM estimada en FP32: alrededor de 1,4 GB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en CPU para inferencia no interactiva.
- Opciones de despliegue: transformers (documentado en la model card), llama.cpp y Ollama mediante conversión a GGUF, y TGI si se convierte el checkpoint; no se documenta soporte nativo de vLLM en la información disponible.
- Latencia y throughput estimados: no disponibles; por el tamaño del modelo, la generación de 120 tokens debería completarse en pocos segundos en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SzaBotond/puli-gpt2-petofi-v01 | 354,6 M | no disponible (entrenado a 256) | húngaro | CC-BY-4.0 | Hugging Face |
| NYTK/PULI-GPT-2 | ~345 M | no disponible | húngaro | no disponible en la información | Hugging Face |
| GPT-2 original (OpenAI) | 124 M / 355 M / 774 M / 1,5 B | 1024 | inglés | MIT | Hugging Face |
| Modelos GPT-2 pequeños ajustados a poesía | variable | variable | variable | variable | Hugging Face |

La comparación directa con GPT-2 original es la más informativa: mismo orden de magnitud de parámetros, pero PULI-GPT-2 está entrenado desde cero para húngaro, mientras que GPT-2 original está orientado al inglés. No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El autor reconoce que el modelo "está lejos de ser perfecto" y que solo produce resultados convincentes de forma ocasional.
- Riesgo alto de alucinación y de incoherencia métrica: al ser un GPT-2 pequeño ajustado con pocos datos, es probable que genere versos que no respeten rima ni métrica húngaras.
- Sesgos: al entrenarse sobre la obra de un único autor del siglo XIX, puede reproducir visiones del mundo, estereotipos de género y referencias nacionales propias de esa época.
- Limitación de contexto: el entrenamiento usó secuencias de 256 tokens, por lo que la coherencia más allá de ese horizonte es limitada.
- Monolingüe: no se ha evaluado su comportamiento fuera del húngaro y no debe usarse para otras lenguas.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero conviene revisar las condiciones del modelo base NYTK/PULI-GPT-2, cuya licencia no se detalla en la información disponible.
- No apto para producción: sin benchmarks, sin evaluación de seguridad y con un corpus muy reducido, no es recomendable para sistemas en producción que requieran fiabilidad.
- El repositorio tiene pocas descargas (277) y ningún "like", lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SzaBotond/puli-gpt2-petofi-v01
- Modelo base: https://huggingface.co/NYTK/PULI-GPT-2
- Referencia del modelo base (Yang et al., MSZNY 2023): "Jönnek a nagyok! BERT-Large, GPT-2 és GPT-3 nyelvmodellek magyar nyelvre", XIX. Magyar Számítógépes Nyelvészeti Konferencia, Szeged, pp. 247-262.
