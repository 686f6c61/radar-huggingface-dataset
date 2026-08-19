# xw1234gan/seccodeplt-qwen2.5-coder-7b-fixed-mixed-grpo-alpha-0.5-pi-theta-real-reward-v2

## Resumen

El modelo `seccodeplt-qwen2.5-coder-7b-fixed-mixed-grpo-alpha-0.5-pi-theta-real-reward-v2` es un checkpoint de investigación desarrollado por xw1234gan para el experimento de cumplimiento de seguridad SecCodePLT+. Se trata de un fine-tuning del modelo base `Qwen/Qwen2.5-Coder-7B-Instruct` mediante el algoritmo GRPO (Group Relative Policy Optimization), orientado a la generación de código que cumpla con políticas de seguridad definidas en el benchmark SecCodePLT+. El problema que resuelve es la evaluación y mejora de la capacidad de los modelos de lenguaje para producir código seguro y conforme a especificaciones, un área crítica en el desarrollo de software asistido por IA.

El modelo tiene 7.615.616.512 parámetros (7,6B) y se distribuye en formato safetensors. Es importante destacar que este repositorio almacena el checkpoint entrenable pi-theta, no un modelo fusionado estáticamente. Para reproducir la política evaluada es necesario combinar sus logits con los de un ancla congelada (`xw1234gan/seccodeplt-qwen2.5-coder-7b-diff-sft-v2`) usando un factor alpha de 0,5. Esta característica lo hace especialmente relevante para investigadores interesados en técnicas de mezcla de logits y optimización de políticas, aunque limita su uso directo en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformers) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen2.5-Coder-7B-Instruct, un transformer decoder-only con 7,6B parámetros. El entrenamiento se realizó con GRPO, una variante de optimización de políticas que utiliza recompensas basadas en evaluaciones de seguridad. En concreto, se empleó la recompensa oficial ReaL safety-unit-test, junto con pérdida de tokens estilo DAPO y muestreo dinámico. El dataset utilizado es `fengyao1909/SecCodePLT_Plus`, con una partición de entrenamiento de 655 ejemplos y una de evaluación de 164 ejemplos, todos evaluados con decodificación greedy.

La innovación principal reside en el enfoque pi-theta: el modelo almacena los parámetros entrenables, y la política final se obtiene mezclando sus logits con los de un ancla congelada (un modelo SFT previo) mediante la fórmula `mixed_logits = 0.5 * pi_theta_logits + 0.5 * anchor_logits`. Esta técnica permite controlar el equilibrio entre el aprendizaje de la política y la estabilidad del modelo base. El entrenamiento usó semilla 42 y corrigió la alineación de etiquetas causales en la versión v2.

## Capacidades

- Generación de código con énfasis en seguridad y cumplimiento de políticas (SecCodePLT+).
- Evaluación de formato de salida, sintaxis, capacidad funcional y seguridad mediante métricas específicas.
- Soporte para mezcla de logits con un ancla congelada, permitiendo ajustar el comportamiento del modelo.
- Entrenado con recompensas basadas en pruebas unitarias de seguridad (ReaL safety-unit-test).
- Capacidad de generar código que pase verificadores de Python con recursos limitados (según el benchmark).
- No se documentan capacidades adicionales como tool calling, agentes o multimodalidad.

## Casos de uso

- Investigación en optimización de políticas de seguridad: el modelo sirve como banco de pruebas para estudiar el efecto de GRPO y la mezcla de logits en la generación de código seguro. Los investigadores pueden reproducir los resultados evaluados y comparar con otras variantes.
- Generación de código con cumplimiento de estándares internos: en entornos donde se exige que el código generado cumpla políticas de seguridad específicas, el modelo puede integrarse en pipelines que mezclen sus logits con el ancla para obtener salidas más seguras.
- Auditoría de código asistida: aunque no es su propósito principal, el modelo puede utilizarse para generar sugerencias de código que cumplan con requisitos de seguridad, sirviendo como apoyo en revisiones manuales.
- Educación en seguridad del código: como herramienta didáctica para mostrar cómo los modelos pueden ser entrenados para priorizar la seguridad, y cómo la mezcla de logits afecta al comportamiento.
- Evaluación de benchmarks de seguridad: el modelo puede emplearse como referencia en la evaluación de otros modelos o técnicas de fine-tuning en el dominio de código seguro.
- Desarrollo de sistemas de generación de código con control de calidad: combinando el checkpoint pi-theta con el ancla, se puede ajustar el equilibrio entre capacidad y seguridad según las necesidades del proyecto.

## Benchmarks y rendimiento

La evaluación se realizó sobre los 164 ejemplos oficiales de test con decodificación greedy. Los resultados son los siguientes:

| Metrica | Valor |
|---|---|
| Mean reward | 0,511491 |
| Output format pass | 99,39% |
| Syntax pass | 98,17% |
| Capability pass | 39,02% |
| Safety pass | 64,02% |
| Joint pass | 31,71% |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- El tamaño del repositorio es de 15,2 GB, lo que sugiere pesos en FP16 (aproximadamente 15 GB para 7,6B parámetros).
- Para inferencia en FP16 se recomienda una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB, o similar).
- Con cuantización a 8 bits se podría reducir el requisito a unos 8 GB, y a 4 bits a unos 4-5 GB, aunque no se proporcionan archivos cuantizados en el repositorio.
- El modelo es compatible con librerías transformers y text-generation-inference, por lo que puede desplegarse con vLLM, TGI u Ollama si se convierte a GGUF.
- No se dispone de datos de latencia o throughput específicos.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de la misma categoría. El modelo base Qwen2.5-Coder-7B-Instruct es el punto de partida, pero no se han publicado resultados comparativos en este benchmark.

## Limitaciones y advertencias

- Es un checkpoint de investigación de una sola semilla (seed 42), por lo que los resultados pueden no ser representativos de la variabilidad del entrenamiento.
- La evaluación se realizó con un verificador de Python limitado por recursos del benchmark, lo que no garantiza la seguridad real del código en entornos de producción.
- No es una garantía general de código seguro; el modelo puede generar código vulnerable fuera de los casos evaluados.
- Para reproducir la política evaluada es imprescindible mezclar los logits con el ancla congelada; usar el checkpoint directamente no produce los resultados reportados.
- La licencia no está disponible, lo que impide determinar si es apto para uso comercial o requiere permisos adicionales.
- No se han evaluado sesgos, alucinaciones ni comportamientos adversos fuera del ámbito del benchmark.

## Enlaces

- Repositorio del modelo: https://huggingface.co/xw1234gan/seccodeplt-qwen2.5-coder-7b-fixed-mixed-grpo-alpha-0.5-pi-theta-real-reward-v2
- Dataset utilizado: https://huggingface.co/datasets/fengyao1909/SecCodePLT_Plus
- Modelo ancla (frozen anchor): https://huggingface.co/xw1234gan/seccodeplt-qwen2.5-coder-7b-diff-sft-v2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
