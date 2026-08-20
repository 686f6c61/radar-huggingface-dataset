# UlukaDev/bitnet-ternary-moe-gguf

## Resumen

UlukaDev/bitnet-ternary-moe-gguf es un sistema experimental de mezcla de expertos (MoE) construido sobre el modelo base BitNet b1.58 2B-4T de Microsoft Research, cuyos pesos son ternarios (cada peso es -1, 0 o +1). El proyecto, desarrollado por UlukaDev, combina un único modelo base cargado una sola vez con dos adaptadores LoRA ligeros que actúan como expertos especializados (multiplicación de dos dígitos y números romanos), activados dinámicamente en tiempo de ejecución por un router externo. El objetivo principal es demostrar que es posible ejecutar un sistema MoE funcional en un portátil convencional, sin GPU, con un consumo de memoria reducido aproximadamente cinco veces frente a una configuración equivalente en bf16.

El repositorio contiene el modelo base convertido a formato GGUF con cuantización ternaria TQ1_0 (1,03 GB), dos adaptadores LoRA en f16 (55 MB cada uno), un parche de correcciones para el motor de inferencia, un script de enrutamiento y un lanzador para Windows. El sistema requiere un fork específico de llama.cpp (qvac-fabric-llm.cpp) con un parche obligatorio que corrige errores de activación FFN, doble cuantización y semántica de `autobitlinear`. Los resultados publicados muestran una precisión de 0,80 en multiplicación de dos dígitos y 0,30 en números romanos, con una precisión de enrutamiento del 100 %.

La relevancia de este modelo radica en su enfoque didáctico y de investigación: demuestra cómo combinar cuantización ternaria extrema, adaptadores LoRA y enrutamiento externo para crear un MoE de bajo coste computacional. No obstante, su alcance funcional es muy limitado (dos tareas específicas) y no está pensado como un modelo de propósito general para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con pesos ternarios (BitNet b1.58) + adaptadores LoRA como expertos |
| Parametros totales | 2.412.820.480 (modelo base, 2,4 B); adaptadores LoRA: no disponible |
| Parametros activos | Modelo base completo (2,4 B) + un adaptador LoRA activo a la vez |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | TQ1_0 (ternario) para el base; f16 para los adaptadores |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (base TQ1_0, adaptadores f16) |

## Arquitectura y entrenamiento

El modelo base es BitNet b1.58 2B-4T de Microsoft Research, un transformer con pesos ternarios (-1, 0, +1) que re-cuantiza sus pesos en cada paso hacia adelante. Sobre este base, el autor entrenó dos adaptadores LoRA (r=32, α=64) exclusivamente en los módulos FFN, uno para multiplicación de dos dígitos y otro para números romanos, utilizando PEFT LoRA sobre la versión bf16 del modelo. Los adaptadores se aplican como deltas en tiempo de ejecución, nunca fusionados, porque la re-cuantización de BitNet destruiría los pesos fusionados.

El enrutamiento lo realiza un componente externo: un modelo de embeddings all-MiniLM-L6-v2 codifica la pregunta del usuario y un router (disponible en el repositorio UlukaDev/bitnet-moe-router) selecciona el experto adecuado. El servidor llama.cpp carga el base y ambos adaptadores, pero solo activa uno a la vez mediante una llamada a la API `/lora-adapters`. No se menciona el uso de RLHF, DPO ni otros métodos de alineación; el entrenamiento se limita a la adaptación supervisada de los LoRA.

## Capacidades

- Generación de texto básica con el modelo base BitNet, aunque su calidad general es limitada fuera de las tareas especializadas.
- Multiplicación aritmética de números de dos dígitos con precisión exacta del 80 % a temperatura 0.
- Conversión a números romanos con precisión del 30 % (mejor que el base bf16 original, que obtiene 0,24).
- Enrutamiento automático de consultas entre expertos con una precisión del 100 % en las pruebas publicadas.
- Ejecución en CPU de portátil sin GPU, gracias a la cuantización ternaria y al tamaño reducido del modelo.
- Soporte de streaming de respuestas en tiempo real mediante el script `moe_driver.py`.
- Interfaz compatible con OpenAI (endpoint `/v1/chat/completions`) para integración sencilla.

## Casos de uso

- Demostración educativa de MoE con cuantización extrema: el modelo sirve como ejemplo práctico de cómo combinar BitNet, LoRA y enrutamiento externo en un sistema funcional, útil para cursos de sistemas de IA eficientes.
- Prototipado en hardware sin GPU: al ejecutarse en CPU con solo ~1 GB de memoria, permite probar conceptos de MoE en portátiles antiguos o dispositivos de bajo consumo.
- Calculadora conversacional especializada: puede responder preguntas de multiplicación de dos dígitos y conversión a números romanos en un chat, útil para aplicaciones educativas de matemáticas básicas.
- Investigación sobre cuantización ternaria y adaptadores: el repositorio incluye un harness de evaluación y resultados comparativos, lo que lo convierte en una base para experimentos sobre formatos TQ1_0 vs TQ2_0 y sus efectos en el rendimiento.
- Integración en pipelines de demostración de llama.cpp: el parche `fabric-bitnet-fixes.patch` documenta correcciones al motor, útil para desarrolladores que trabajen con BitNet en ese fork.
- Benchmarking de enrutamiento de expertos: el router externo con all-MiniLM-L6-v2 puede evaluarse como componente independiente para tareas de clasificación de intenciones simples.

## Benchmarks y rendimiento

Los resultados publicados en la model card, obtenidos a temperatura 0 con coincidencia exacta en la línea `The answer is X`, comparan el sistema ternario con el base bf16 original y con el base ternario sin experto:

| Tarea | Sistema ternario (TQ1_0) | Base bf16 original | Base ternario sin experto |
|---|---|---|---|
| Multiplicación de 2 dígitos | 0,80 | 0,94 | 0,70 |
| Números romanos | 0,30 | 0,24 | 0,05 |
| Precisión de enrutamiento | 1,00 | — | — |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K. El autor advierte que el formato TQ2_0 degrada el rendimiento del experto débil (0,05, por debajo del base sin experto), por lo que recomienda usar TQ1_0.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo se ejecuta en CPU.
- RAM: aproximadamente 1,2 GB para el modelo base y adaptadores (1,03 GB + 2 × 55 MB), más overhead del motor.
- GPU recomendada: ninguna; diseñado para portátiles convencionales.
- Compatibilidad con GPU de consumo: no aplica, aunque podría ejecutarse en GPU si se desea, pero no es el objetivo.
- Opciones de despliegue: llama-server del fork qvac-fabric-llm.cpp con el parche aplicado; no compatible con vLLM, Ollama o TGI estándar sin modificaciones.
- Latencia y throughput: no disponible; depende del hardware CPU y de la longitud de la respuesta (máximo 384 tokens por defecto).

## Comparativa con modelos similares

No existen modelos directamente comparables, ya que la combinación de BitNet ternario, LoRA como expertos y enrutamiento externo es un enfoque experimental único. Como referencia, se puede comparar con el propio base bf16 y con modelos pequeños de propósito general, aunque sin datos de benchmarks comunes:

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| UlukaDev/bitnet-ternary-moe-gguf | 2,4 B + LoRA | 4096 | MIT | MoE con base ternaria y 2 expertos LoRA |
| microsoft/bitnet-b1.58-2B-4T (bf16) | 2,4 B | 4096 | MIT | Base ternario sin MoE |
| Qwen2.5-1.5B (referencia) | 1,5 B | 32768 | Apache 2.0 | Modelo denso de propósito general |

La comparativa con Qwen2.5 es orientativa: el modelo de UlukaDev no está diseñado para tareas generales y carece de benchmarks estándar, por lo que no se puede establecer una comparación cuantitativa justa.

## Limitaciones y advertencias

- Especialización extrema: solo es competente en multiplicación de dos dígitos y números romanos; fuera de estas tareas, la calidad de generación es baja y propensa a alucinaciones.
- Dependencia de un fork específico: requiere qvac-fabric-llm.cpp con el parche `fabric-bitnet-fixes.patch`; el fork estándar produce salidas repetitivas y corruptas.
- Prohibición de fusionar adaptadores: mezclar los LoRA en el base destruye el modelo (degenera en tokens repetidos); deben aplicarse siempre como deltas en tiempo de ejecución.
- Contexto limitado a 4096 tokens, insuficiente para tareas de razonamiento largo o conversaciones extensas.
- Idiomas no especificados; el entrenamiento y las pruebas se documentan en inglés, sin garantía de soporte multilingüe.
- Sin benchmarks estándar (MMLU, HumanEval, etc.), lo que impide evaluar su rendimiento general frente a otros modelos.
- Riesgo de sesgos no documentados: al ser un modelo pequeño y especializado, no se han realizado evaluaciones de sesgo o toxicidad.
- Licencia MIT permite uso comercial, pero el modelo no es adecuado para producción real debido a sus limitaciones funcionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/UlukaDev/bitnet-ternary-moe-gguf
- Código, lanzador y harness de evaluación: https://github.com/agentulukaADMIN/ternary-moe
- Router de expertos: https://huggingface.co/UlukaDev/bitnet-moe-router
- Motor de inferencia (fork con parche): https://github.com/tetherto/qvac-fabric-llm.cpp
- Modelo base original: https://huggingface.co/microsoft/bitnet-b1.58-2B-4T
