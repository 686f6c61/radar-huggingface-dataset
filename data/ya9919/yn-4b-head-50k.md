# ya9919/YN-4b-head-50k

## Resumen

YN-4b-head-50k es un checkpoint de investigación publicado por el usuario ya9919 en el marco del proyecto S²-MAS (society-scale multi-agent simulation), un framework de simulación multiagente a escala social para estudiar decisiones financieras de hogares. El modelo no es un modelo de lenguaje generativo al uso: se trata de una cabeza de decisión escalar compartida (decision head) entrenada sobre un backbone Qwen3.5-4B-Base congelado, cuyo único cometido es puntuar menús de candidatos en tareas de pregunta-respuesta financiera (financial QA) sobre datos de encuestas reales.

La arquitectura sigue la ruta "language model + learned decision head": el backbone oficial Qwen3.5-4B-Base permanece congelado y solo se entrena una cabeza escalar que asigna una puntuación a cada candidato codificado de forma independiente. El checkpoint corresponde a la referencia de backbone congelado en una comparación de presupuestos anidados, con 50.000 filas distintas de entrenamiento y 100.000 exposiciones acumuladas seleccionadas de una ejecución terminal de 250.000.

Su relevancia es acotada y muy específica: sirve como punto de comparación controlado frente a métodos de adaptación con LoRA sobre el mismo backbone y los mismos datos, dentro de un benchmark de 240.458 registros de test, 119 versiones de pregunta y 8.275 grupos de hogar. No está pensado para uso general ni para generación de texto libre, y su licencia restringe el uso a investigación científica no comercial sin redistribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone transformer Qwen3.5-4B-Base congelado + cabeza de decisión escalar compartida (head_only) |
| Parametros totales | 4B en el backbone (Qwen3.5-4B-Base); parámetros de la cabeza no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; inferencia reportada en BF16 para el backbone y FP32 para el scoring de candidatos |
| Idiomas soportados | Inglés (en) |
| Licencia | S²-MAS Controlled Model Research License v1.2 (other): uso científico no comercial, sin redistribución |
| Formato de pesos | head.pt (cabeza de decisión); el backbone Qwen3.5-4B-Base se obtiene por separado |

## Arquitectura y entrenamiento

El modelo combina un backbone transformer preentrenado Qwen3.5-4B-Base, que se mantiene completamente congelado, con una cabeza escalar compartida que aprende a puntuar candidatos codificados de forma independiente. La inferencia puntúa el estado completo del hogar, la pregunta y el menú completo de candidatos, y selecciona la opción con mayor puntuación. El paquete incluye `qwen_decision.py` como interfaz de scoring de candidatos y `decision_config.json` para localizar el backbone y el tokenizador oficiales, que deben descargarse aparte.

El entrenamiento es de tipo `head_only` sobre 50.000 filas distintas de la partición fija de decision-QA, con 250.000 exposiciones terminales en la etapa y 100.000 exposiciones acumuladas en el checkpoint seleccionado. La selección del checkpoint se hizo con un conjunto de desarrollo fijo de 20.000 ejemplos; la partición de desarrollo completa (412.873 ejemplos) se reserva para comparar los dos métodos de adaptación de Qwen4B a 200k. El aprendizaje de decisiones se basa en datos de encuestas reales. No se reporta uso de RLHF ni DPO.

## Capacidades

- Puntuación de candidatos en preguntas de elección financiera de hogar (respuestas tipo sí/no y menús de opciones múltiples).
- Clasificación de decisiones a partir de un estado de hogar más una pregunta y un menú de candidatos.
- Inferencia determinista sobre un espacio fijo de candidatos, con cero decisiones inválidas reportadas en el test común.
- Evaluación sobre 119 versiones de pregunta distintas dentro del benchmark del proyecto.
- No soporta generación de texto libre, tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No dispone de modo thinking, visión ni audio.
- Multilingüismo limitado al inglés.

## Casos de uso

- Investigación comparativa de métodos de adaptación: sirve como referencia de backbone congelado frente a variantes LoRA con los mismos datos, aislando cuánto rendimiento aporta la cabeza frente a la actualización del backbone.
- Simulación de decisiones de consumo en agentes sintéticos: integrado en el motor S²-MAS, puntúa opciones de financiación de compras para hogares sintéticos bajo condiciones emparejadas.
- Modelado de tenencia de productos financieros: responde preguntas como uso de tarjetas de crédito, cuentas de depósito a la vista, cuentas de valores o depósitos a plazo no vencidos a partir del estado del hogar.
- Estudios de calibración en encuestas: la métrica de F1 macro por pregunta permite analizar el comportamiento del modelo por versión de pregunta y detectar clases con bajo rendimiento.
- Prototipado de cabezas de decisión de bajo coste: al congelar el backbone, el entrenamiento se limita a la cabeza, lo que reduce el coste computacional frente a fine-tuning completo.
- Auditoría de sesgos en decisiones financieras sintéticas: al ser un entorno controlado y reproducible, facilita analizar cómo el estado del hogar condiciona las respuestas del modelo.
- Reproducción de resultados del paper S²-MAS: el checkpoint forma parte de las 17 entradas de repositorio que componen el benchmark de seis rutas de decisión.

## Benchmarks y rendimiento

Test común: 240.458 registros QA, 119 versiones de pregunta, 8.275 grupos de respondiente/hogar. La exactitud pondera cada registro por igual y las decisiones inválidas cuentan como incorrectas; el F1 macro por pregunta promedia sobre las clases definidas de cada versión y pondera las 119 versiones por igual.

| Checkpoint / referencia | Accuracy (%) | F1 macro por pregunta (%) | Decisiones inválidas |
|---|---:|---:|---:|
| Este checkpoint (head_only, 50k) | 67,3369 | 31,0166 | 0 |
| Qwen4B LoRA + head, mismas 50k QA únicas | 73,7289 | 36,6225 | 0 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; requiere cargar el backbone Qwen3.5-4B-Base completo en BF16 (aproximadamente 8 GB solo para pesos, más overhead de activaciones y del scoring en FP32 de candidatos).
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño del backbone, una GPU con 16 GB o más de VRAM resulta adecuada para inferencia en BF16.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas de 16 GB o más (por ejemplo, RTX 4080/4090), aunque el autor no lo confirma.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el paquete proporciona `qwen_decision.py` como interfaz propia de scoring.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy (test común) | F1 macro | Licencia |
|---|---|---:|---:|---:|---|
| YN-4b-head-50k (este) | 4B backbone congelado + cabeza | No disponible | 67,34 % | 31,02 % | S²-MAS v1.2, solo investigación |
| Qwen4B LoRA + head (50k) | 4B con LoRA + cabeza | No disponible | 73,73 % | 36,62 % | No disponible |
| Otras rutas del benchmark S²-MAS | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El modelo no genera texto: solo puntúa candidatos de un menú predefinido, por lo que no es utilizable como LLM conversacional.
- Requiere obligatoriamente el backbone Qwen3.5-4B-Base y el tokenizador oficiales, que no se distribuyen en este repositorio.
- Rendimiento inferior al checkpoint LoRA equivalente (67,34 % frente a 73,73 % de accuracy), lo que refleja que la congelación del backbone limita la adaptación.
- El F1 macro por pregunta es bajo (31,02 %), lo que indica un comportamiento desigual entre versiones de pregunta y posibles clases con rendimiento muy pobre.
- Solo soporta inglés; no hay evidencia de generalización a otros idiomas.
- Riesgo de sesgo: entrenado con datos de encuestas reales, puede reproducir patrones demográficos y socioeconómicos presentes en esos datos.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de decisiones erróneas sistemáticas en hogares fuera de la distribución de entrenamiento.
- Licencia S²-MAS Controlled Model Research License v1.2: uso científico no comercial, sin redistribución; el uso comercial está prohibido.
- La implementación del motor GENESE/MAS permanece privada, lo que limita la reproducibilidad completa del pipeline.
- El repositorio figura con 0 GB de tamaño y 0 descargas, por lo que la disponibilidad y el soporte de la comunidad son mínimos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ya9919/YN-4b-head-50k
- Licencia: https://huggingface.co/ya9919/YN-4b-head-50k/blob/main/LICENSE
- Repositorio GitHub del proyecto: https://github.com/KataDavidXD/s2-mas
- Paper S²-MAS: https://github.com/KataDavidXD/s2-mas/blob/main/paper/S2_MAS_Paper.pdf
- Ejemplos QA en JSON: qa_examples.json (referenciado en la model card del repositorio)
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
