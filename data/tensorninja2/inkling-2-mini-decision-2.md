# tensorninja2/inkling-2-mini-decision-2

## Resumen

inkling-2-mini-decision-2 es un adaptador LoRA sobre el modelo base thinkingmachines/Inkling-2-Mini, desarrollado por el usuario tensorninja2. No es un modelo generativo de texto: implementa una "cabeza puntero" (pointer head) que devuelve una probabilidad por cada opción de una pregunta tipada sobre un estado de entrada, sin generar texto. Está pensado como modelo de decisión y clasificación para sistemas que necesitan respuestas booleanas o categóricas calibradas en lugar de generación libre.

El adaptador se distribuye en formato propietario `.ninfer` (23.764.668 bytes) y requiere el runtime NInfer-4090 junto con el artefacto Inkling 2 Mini NInfer. No es cargable con PEFT, Transformers ni cargadores GGUF. La licencia es Apache 2.0 y el pipeline declarado es text-classification.

Su relevancia radica en el enfoque de calibración: el adaptador reporta mejoras de hasta +15,3 puntos porcentuales de precisión sobre su predecesor en paneles de preguntas difíciles, con métricas explícitas de Brier, NLL y ECE, y una temperatura ajustada de 1,701 (IC 90%: 1,55-1,87). Está orientado a ejecución local en RTX 4090 con cuantización simulada A4/A8.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 16, alpha 32) sobre thinkingmachines/Inkling-2-Mini, con cabeza puntero de 256 dimensiones |
| Parámetros totales | no disponible (el adaptador ocupa 23.764.668 bytes; el modelo base no reporta cifra) |
| Parámetros activos | no disponible |
| Longitud de contexto | 32.768 tokens (según el comando de servicio `--max-context 32768`) |
| Tipos de cuantización | Cuantización simulada nativa A4/A8 durante entrenamiento; KV en BF16 en inferencia |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (LoRA propietario, no compatible con safetensors, GGUF ni PEFT) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA de rango 16 y alpha 32 sobre las proyecciones de query, query de posición relativa, output gate, attention sink, key, value y salida de atención del modelo base Inkling-2-Mini. Sobre el estado oculto final (de anchura 2.304) añade una cabeza puntero con proyecciones query y key de 256 dimensiones que produce una probabilidad por opción. La temperatura de calibración es 1,701 (IC 90%: 1,55-1,87). El adaptador se distribuye como un fichero de 23,7 MB con SHA-256 `4c76b6b1d14d2c830e277f7bd438484ad1eb0555a91797cadf648c1d65aaf1a5`.

El entrenamiento continuó desde los pesos LoRA de atención y la cabeza puntero de inkling-2-mini-decision-1. Se usaron 26.539 registros que combinan los splits de entrenamiento documents-v1, hard-v1 y devtools-v1 de kev (ronda 18) con 10.000 registros de replay de decision-v7. Los expertos del modelo base permanecieron congelados y se empleó cuantización simulada nativa A4/A8. La calibración se ajustó sobre 648 preguntas retenidas de ocho fuentes públicas y filas MMLU-Pro.

## Capacidades

- Clasificación y decisión tipada: responde preguntas con tipo `predicate` (y presumiblemente otros tipos) devolviendo una probabilidad por opción, sin generar texto.
- Calibración de confianza: expone probabilidades calibradas con temperatura ajustada, con métricas ECE tan bajas como 0,019 en algunos paneles.
- Detección de incertidumbre: en el conjunto transfer-v9 de 110 registros no resolubles, la proporción de respuestas con confianza ≥ 0,9 bajó del 7,3% a cero.
- Integración vía API compatible con OpenAI: endpoint `decisions.create` con OpenAI Python SDK 3.26.0 o superior.
- Integración con TypeSafe System One: endpoint `POST /typesafe/v1/systemone` con TypeSafe SDK 0.6 o 0.7.
- Soporte de múltiples adaptadores simultáneos: `--lora-slots 2` permite cargar hasta dos adaptadores LoRA.
- Contexto largo: hasta 32.768 tokens con KV en BF16.
- No soporta generación de texto libre, tool calling, agentes ni visión (no disponible en la información).

## Casos de uso

- **Enrutamiento de tickets de soporte**: clasificar mensajes entrantes con preguntas tipadas como "¿es sobre facturación?" y usar la probabilidad para decidir la cola. El ejemplo de la model card (`billing` sobre "I was charged twice this month") ilustra este patrón con latencia de milisegundos sobre estados cacheados.
- **Moderación y filtrado con umbral de confianza**: aprovechar la calibración (ECE 0,019-0,052) para fijar umbrales de decisión con garantías estadísticas, derivando a revisión humana los casos de baja confianza.
- **Extracción de atributos booleanos en documentos**: usar el panel documents-v1 (precisión 0,891) para decidir presencia o ausencia de condiciones contractuales, cláusulas o campos estructurados en textos largos de hasta 32K tokens.
- **Validación en pipelines CI/CD con TypeSafe**: integrar el endpoint `/typesafe/v1/systemone` para evaluar predicados sobre estados de build o configuración, con tipado estricto y respuestas deterministas en probabilidad.
- **Sistemas de decisión de baja latencia**: con 70 ms para seis preguntas sobre un estado cacheado de 8K tokens en RTX 4090, es apto para bucles de decisión interactivos o agentes que requieran múltiples consultas por turno.
- **Evaluación de incertidumbre en producción**: emplear las probabilidades calibradas para implementar abstención automática (rechazar respuestas con probabilidad por debajo de un umbral) en lugar de generar texto y parsearlo.
- **Clasificación de conocimiento general acotado**: usar el panel breadth-v1 (precisión 0,779) para tareas de categorización amplia, teniendo en cuenta la advertencia de que no supera a decision-1 en este eje.

## Benchmarks y rendimiento

Panel de desarrollo (evaluación del 2026-11-23, RTX 4090, KV BF16, temperatura 1,701):

| Panel | Preguntas | Accuracy | Brier | NLL | ECE | Ganancia vs padre (pp) | vs Qwen (pp) |
|---|---:|---:|---:|---:|---:|---:|---:|
| decision-v7 | 1.264 | 0,854 | 0,208 | 0,388 | 0,019 | +0,3 [−1,0, +1,6] | −2,6 [−4,0, −1,3] |
| hard-v1 | 1.083 | 0,803 | 0,273 | 0,495 | 0,052 | +15,3 [+12,4, +18,3] | −5,9 |
| devtools-v1 | 772 | 0,768 | 0,307 | 0,511 | 0,036 | +12,4 [+9,6, +15,2] | −8,2 |
| documents-v1 | 920 | 0,891 | 0,145 | 0,266 | 0,020 | +6,4 [+4,1, +8,7] | −2,0 [−3,9, −0,1] |
| transfer-v4 short states | 576 | 0,865 | 0,203 | 0,338 | 0,029 | +1,7 [−0,5, +4,2] | −2,1 [−4,0, 0,0] |
| breadth-v1 | 2.475 | 0,779 | 0,306 | 0,553 | 0,019 | +0,4 [−0,8, +1,7] | −4,2 [−5,5, −2,8] |

Ganancia combinada en el panel primario (hard-v1 + devtools-v1): +14,1 pp [+12,1, +16,3]. ECE en hard-v1 bajó de 0,063 a 0,052.

Tests bloqueados (lectura única del 2026-11-23):

| Split | Adaptador | Preguntas | Accuracy | Brier | NLL | ECE |
|---|---|---:|---:|---:|---:|---:|
| decision-v7 | decision-2 | 1.200 | 0,843 | 0,211 | 0,387 | 0,021 |
| decision-v7 | decision-1 | 1.200 | 0,837 | no disponible | no disponible | 0,013 |
| breadth-v1 | decision-2 | 2.489 | 0,763 | 0,316 | 0,556 | 0,025 |

En breadth-v1 test la precisión cayó 1,3 pp [−2,5, −0,3] respecto a decision-1: el adaptador no es mejor que su predecesor en conocimiento general amplio.

## Requisitos de hardware

- **GPU objetivo**: RTX 4090 (arquitectura SM89, indicada en el nombre del runtime NInfer-4090).
- **VRAM estimada**: no disponible en la información; el adaptador pesa 23,7 MB y el modelo base requiere el artefacto Inkling 2 Mini NInfer, cuyo tamaño no se especifica.
- **Cabe en consumer GPU**: sí, según el diseño explícito para RTX 4090.
- **Runtime de despliegue**: NInfer-4090 (`./build-sm89/apps/ninfer-serve`); no compatible con vLLM, llama.cpp, Ollama, TGI, PEFT ni Transformers.
- **Latencia medida**: 70 ms para seis preguntas sobre estado cacheado de 8K tokens (Inkling) frente a 101 ms en Qwen; 2,09 s para una pregunta sobre estado frío de 8K tokens frente a 3,78 s en Qwen.
- **Configuración de servicio**: `--kv-dtype bf16 --max-context 32768 --lora-dir lora/inkling-2-mini --lora-slots 2`.
- **Throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Base | Contexto | Accuracy (hard-v1) | ECE (hard-v1) | Licencia | Formato |
|---|---|---:|---:|---:|---|---|
| inkling-2-mini-decision-2 | Inkling-2-Mini | 32.768 | 0,803 | 0,052 | Apache 2.0 | `.ninfer` |
| inkling-2-mini-decision-1 | Inkling-2-Mini | 32.768 | 0,650 (implícito, +15,3 pp) | 0,063 | Apache 2.0 | `.ninfer` |
| qwen3.8-27b-decision-2 | Qwen 3.8 27B | no disponible | 0,862 (implícito, +5,9 pp) | no disponible | no disponible | no disponible |

El adaptador Qwen supera a Inkling en precisión en todos los paneles (entre 2,0 y 8,2 pp), pero es más lento: 101 ms frente a 70 ms en estado cacheado de 8K y 3,78 s frente a 2,09 s en estado frío.

## Limitaciones y advertencias

- **Errores de alta confianza en estados cortos**: el 3,1% de las respuestas fueron incorrectas con confianza ≥ 0,9, frente al 1,9% de decision-1 (+1,2 pp [−0,7, +3,0]); el límite superior excede el incremento permitido de +1 pp.
- **Regresión en conocimiento general**: en breadth-v1 test la precisión cae 1,3 pp respecto a decision-1; tratar decision-2 como no mejor que su predecesor en este eje.
- **Un fallo bajo las reglas round-27**: el adaptador se publica pese a incumplir una regla de kev y el guard de breadth.
- **Formato propietario**: el fichero `.ninfer` no es utilizable con PEFT, Transformers ni GGUF; requiere NInfer-4090 y el artefacto base específico.
- **Restricción de adaptadores**: el servidor rechaza adaptadores de otro modelo base; solo se admiten adaptadores Inkling en `lora/inkling-2-mini/`.
- **Sin generación de texto**: no apto para tareas generativas, tool calling, agentes ni visión.
- **Idiomas no declarados**: no hay información sobre cobertura multilingüe.
- **Sesgos**: no disponible en la información.
- **Licencia Apache 2.0**: permite uso comercial, pero el runtime y el artefacto base tienen sus propias condiciones no detalladas aquí.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tensorninja2/inkling-2-mini-decision-2
- Modelo predecesor: https://huggingface.co/tensorninja2/inkling-2-mini-decision-1
- Artefacto base Inkling 2 Mini NInfer: https://huggingface.co/tensorninja2/Inkling-2-Mini-NInfer
- Comparativa Qwen: https://huggingface.co/tensorninja2/qwen3.8-27b-decision-2
- Runtime NInfer-4090: https://github.com/tensorninja/ninfer-4090
- Documentación de servicio TypeSafe System One: https://github.com/tensorninja/ninfer-4090/blob/tensorninja/docs/serving.md#system-one-decisions
- Herramienta kev: https://github.com/jaredpalmer/kev
