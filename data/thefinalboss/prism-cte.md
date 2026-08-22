# thefinalboss/prism-cte

## Resumen

PRISM-CTE es una extensión experimental del modelo PRISM (originalmente desarrollado por AFKmoney) que incorpora un "Adaptive Continuous Thought Engine" (CTE), un mecanismo de pensamiento continuo diferenciable. El autor, thefinalboss, lo ha entrenado sobre los conjuntos de datos `cognitive_skills` de `thefinalboss/fractus-datasets` con el objetivo de mejorar la generación de texto relacionado con habilidades de pensamiento algorítmico y razonamiento bajo presión. No es un transformer puro: se describe como una arquitectura con "Multi-Rate Bus" y "expertos polimórficos".

El proyecto es relevante porque propone un enfoque alternativo al razonamiento explícito (tipo "chain-of-thought") mediante un bucle de pensamiento continuo y diferenciable que se aprende de forma end-to-end. Sin embargo, el modelo es un prototipo de investigación sin despliegue público, sin pesos publicados en HuggingFace (solo código fuente en el repositorio) y con métricas limitadas. No se han publicado especificaciones completas de arquitectura, tamaño, contexto o idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (descrita como "Multi-Rate Bus + expertos polimórficos + CTE adaptativo"; no es un transformer puro) |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no se indica si es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (la generación tras el entrenamiento produce frases en inglés) |
| Licencia | MIT (según el status del README) |
| Formato de pesos | No disponible (no se publican pesos; solo código fuente en Python) |

## Arquitectura y entrenamiento

La arquitectura de PRISM-CTE se describe como una extensión del modelo PRISM original. No se proporcionan detalles sobre el tamaño de capas, dimensiones o número de parámetros. Según el README, el sistema incorpora un "Adaptive CTE" (en `prism/cte.py`) con un `ThinkController` que aprende un presupuesto de pensamiento continuo y logits de continuación, con pasos internos suavizados por una puerta diferenciable y dinámicas de acumulación estilo "Fractus". El bloque `PrismBlockWithCTE` se integra como reemplazo directo.

El entrenamiento se realizó sobre los datos `cognitive_skills/*` de `thefinalboss/fractus-datasets`. Se emplea un `ContinuousTrainer` que mantiene optimizador y memoria sin resetear. La función de pérdida auxiliar está acotada: peso de balance de carga `0.02`, entropía de memoria `0.001 * clamp(ent, max=20)`, y la pérdida total sigue la entropía cruzada (CE). Se reportan métricas de entrenamiento en una RTX 5060 Ti: en la primera ejecución (pasos 1→400) la CE bajó de 10.86 a 0.16 con ~2900 tokens/s; en la reanudación (pasos 401+) la CE rondó ~0.10 con ~4700 tokens/s. No se menciona el uso de RLHF, DPO ni otros métodos de alineación.

## Capacidades

- Generación de texto en inglés, orientada a razonamiento algorítmico y "habilidades de pensamiento bajo presión" (según el dataset de entrenamiento).
- Bucle de pensamiento continuo aprendido (CTE) que permite pasos de razonamiento internos diferenciables.
- Soporte de entrenamiento continuado con checkpoint y reanudación.
- No se documenta soporte de tool calling, agentes, visión, audio ni multilingüismo.

## Casos de uso

- **Investigación en razonamiento continuo**: permite estudiar cómo un modelo puede aprender a realizar pasos de pensamiento internos sin generar texto explícito de cadena de pensamiento, útil para experimentos en laboratorio.
- **Prototipado de arquitecturas híbridas**: sirve como banco de pruebas para combinar buses multi-tasa con expertos polimórficos y módulos de control adaptativo.
- **Entrenamiento con datos de habilidades cognitivas**: se puede usar para entrenar modelos que generen texto sobre estrategias de resolución de problemas, aunque sin validación en tareas reales.
- **Experimentos de optimización de pérdida auxiliar**: el diseño con pérdida auxiliar acotada puede ser útil para estudiar cómo regular la entropía de memoria en modelos con bucles internos.
- **Educación en desarrollo de arquitecturas**: el código fuente (CTE, modelo y entrenador) es útil para enseñar implementaciones de módulos de razonamiento diferenciable.
- **Generación de frases cortas en inglés**: tras el entrenamiento, el modelo produce frases en inglés relacionadas con el dataset, aunque sin garantía de calidad ni utilidad práctica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos numéricos son métricas de entrenamiento (CE, pérdida aux, tokens por segundo) reportadas en la model card, que se muestran en la siguiente tabla a modo de referencia:

| Fase | Pasos | CE | Aux | tok/s | Notas |
|------|-------|-----|-----|-------|-------|
| Primera ejecución real | 1→400 | 10.86 → 0.16 | (escalado antiguo) | ~2900 | Aparecen palabras |
| Validación fix aux | 50 | sigue CE | ~+0.02 | — | aux acotado |
| Reanudación (desde 400) | 401+ | ~0.10 | ~+0.07 | ~4700 | en curso |

Estos datos no son comparables con benchmarks estándar y no permiten evaluar el rendimiento real del modelo en tareas comunes.

## Requisitos de hardware

- No se indican requisitos de VRAM para inferencia.
- El entrenamiento se realizó en una GPU RTX 5060 Ti (8 GB VRAM) con batches de 4 y secuencias de 64 tokens, alcanzando ~2900-4700 tok/s en entrenamiento.
- No hay datos sobre inferencia en CPU, GPU consumer o despliegue.
- No se mencionan herramientas de despliegue como vLLM, llama.cpp, Ollama o TGI.
- El código requiere PyTorch y Transformers, pero no se han publicado pesos listos para usar.

## Comparativa con modelos similares

No disponible. No se ha encontrado información sobre modelos comparables de la misma categoría (arquitecturas con bucles de pensamiento continuo o variantes de PRISM). El proyecto es experimental y no se ha posicionado frente a otros modelos.

## Limitaciones y advertencias

- Modelo en fase de desarrollo: solo contiene código fuente, no se publican pesos ni checkpoints en HuggingFace.
- No hay validación en tareas estándar de NLP; la calidad generativa es desconocida.
- Riesgo de alucinación y de texto incoherente, especialmente fuera del dominio de entrenamiento.
- La licencia MIT permite uso comercial, pero al no haber pesos publicados, no se puede usar directamente en producción.
- No se especifican sesgos conocidos, pero el entrenamiento con datos sintéticos de un solo autor puede introducir sesgos no documentados.
- No hay soporte de multilingüismo; el modelo genera texto en inglés (según el ejemplo).
- No se proporcionan requisitos de contexto ni de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thefinalboss/prism-cte
- Dataset de entrenamiento: https://huggingface.co/datasets/thefinalboss/fractus-datasets
- Repositorio original PRISM (referenciado en el README): https://github.com/AFKmoney/prism
- Wiki del proyecto (spaces): https://huggingface.co/spaces/thefinalboss/fractus-cte-wiki

Nota: los resultados de búsqueda web sobre "PrismML" y "Prism de OpenAI" no están relacionados con este modelo.
