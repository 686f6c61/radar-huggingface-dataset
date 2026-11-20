# SZLHOLDINGS/salad-governed-distill-27b-qlora-r1

## Resumen

`SZLHOLDINGS/salad-governed-distill-27b-qlora-r1` es un adaptador LoRA (PEFT) publicado por SZLHOLDINGS sobre el modelo base `Qwen/Qwen3.8-27B`. Se trata de un ajuste fino supervisado (SFT) mediante la librería TRL, orientado a generación de texto conversacional. El repositorio ocupa 0,3 GB, lo que confirma que solo contiene los pesos del adaptador y no el modelo completo.

La relevancia del artefacto es limitada tal y como está publicado: la model card es la plantilla por defecto de Hugging Face sin rellenar, con todos los campos marcados como "[More Information Needed]". No se documentan datos de entrenamiento, hiperparámetros, evaluación ni uso previsto. El nombre sugiere una destilación ("distill") con algún tipo de gobernanza ("governed") y cuantización QLoRA, pero ninguno de estos extremos está verificado en la información disponible.

El modelo base declarado, Qwen3.8-27B, no aparece en la información proporcionada más allá del identificador, por lo que sus especificaciones (contexto, arquitectura, licencia) no se pueden confirmar aquí. Cualquier evaluación en producción debería partir de la premisa de que se trata de un adaptador sin validación pública, con cero descargas y cero interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer (modelo base Qwen/Qwen3.8-27B; arquitectura del base no disponible) |
| Parametros totales | No disponible (el adaptador ocupa 0,3 GB; el base no se especifica) |
| Parametros activos | No aplica (no se indica que el base sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el nombre sugiere QLoRA en el entrenamiento, no se documentan formatos de inferencia) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con PEFT 0.21.2 y TRL, según los metadatos del repositorio. La etiqueta `sft` indica ajuste fino supervisado sobre el modelo base `Qwen/Qwen3.8-27B`. El sufijo `qlora` del identificador sugiere que el entrenamiento se realizó con cuantización de 4 bits del modelo base, aunque no se aporta confirmación ni configuración (bits, tipo de quant, rango LoRA, alpha, target modules).

No hay información sobre el volumen de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF/DPO, ni sobre innovaciones técnicas (decodificación especulativa, atención lineal, etc.). Tampoco se documentan hiperparámetros, hardware utilizado ni duración del entrenamiento. Todo ello figura como "[More Information Needed]" en la model card.

## Capacidades

- Generación de texto conversacional: es la única capacidad declarada de forma explícita mediante el `pipeline_tag: text-generation` y la etiqueta `conversational`.
- Ajuste fino sobre Qwen3.8-27B: hereda las capacidades del modelo base en la medida en que el adaptador no las degrade, pero no se documenta ninguna evaluación al respecto.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Evaluación experimental de adaptadores LoRA: el artefacto se puede cargar junto al base Qwen3.8-27B para comparar su comportamiento frente al modelo sin ajustar en tareas conversacionales, siempre que se disponga del base y de una licencia compatible.
- Investigación sobre destilación y gobernanza de modelos: el nombre del repositorio sugiere una línea de trabajo en torno a destilación con restricciones de gobernanza; puede servir como punto de partida para reproducir o auditar dicho enfoque, aunque la falta de documentación obliga a inferir la metodología.
- Pruebas de integración con PEFT y TRL: útil para validar pipelines de carga de adaptadores (`PeftModel.from_pretrained`) en entornos de investigación con transformers.
- Base para comparativas internas: si un equipo ya opera Qwen3.8-27B, este adaptador permite medir el efecto de un SFT adicional en tareas concretas de su dominio, sin compromiso de producción.
- Docencia y formación: ejemplo práctico de publicación de un adaptador LoRA con la plantilla estándar de Hugging Face, útil para ilustrar buenas (y malas) prácticas de documentación de modelos.
- No se recomienda su uso en producción, atención al cliente ni generación de código sin una evaluación previa propia, dado que no hay benchmarks, licencia declarada ni descripción de datos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para el adaptador: despreciable (0,3 GB en disco); el coste real depende del modelo base Qwen3.8-27B, cuyas especificaciones no se detallan en la información proporcionada.
- VRAM para el base en precisión completa: no disponible (depende del número de parámetros y del dtype; con un nombre "27B" y bf16 se situaría en torno a 54 GB, estimación orientativa no confirmada).
- GPU recomendadas: no disponible. Para un base de ese orden serían necesarias A100/H100 o varias GPU consumer con paralelización, pero no se puede confirmar sin las specs del base.
- Cabe en GPU consumer: no confirmado; un base de ~27B en cuantización 4 bits podría ajustarse en GPUs de 24 GB, pero es una estimación no verificada.
- Opciones de despliegue: carga del adaptador con PEFT + transformers; para servicio, vLLM o TGI requerirían fusionar el adaptador con el base (merge) o soporte de adaptadores LoRA en el servidor de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SZLHOLDINGS/salad-governed-distill-27b-qlora-r1 | Adaptador sobre base no especificado | No disponible | No disponible | 0 descargas, 0 likes | Model card vacía |
| Qwen/Qwen3.8-27B (base declarado) | No disponible en la información | No disponible | No disponible | Referenciado como base | Specs no confirmadas aquí |
| Adaptadores LoRA públicos sobre Qwen (genéricos) | Variable | Heredado del base | Variable según autor | Amplia disponibilidad | Requieren evaluación propia |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Model card sin contenido: todos los campos relevantes (datos, evaluación, uso previsto, sesgos) están marcados como "[More Information Needed]".
- Licencia no declarada: no se puede determinar si el uso comercial está permitido; además, la licencia del adaptador debe ser compatible con la del modelo base Qwen3.8-27B, que tampoco se especifica.
- Riesgo de alucinación: inherente a los modelos generativos y no evaluado en este artefacto.
- Sesgos: no documentados; al desconocerse los datos de entrenamiento, no es posible auditar sesgos.
- Idiomas: no se declaran idiomas soportados; el comportamiento multilingüe es desconocido.
- Sin benchmarks ni métricas: no hay evidencia pública de mejora respecto al base.
- Cero tracción comunitaria (0 descargas, 0 likes): no hay retroalimentación de terceros que permita detectar problemas.
- Repositorio de 0,3 GB: solo contiene el adaptador; es imprescindible descargar el modelo base para utilizarlo, con el coste de almacenamiento y cómputo asociado.
- Fechas de creación y actualización en 2026: conviene verificar la vigencia y la integridad de los artefactos antes de cualquier uso.
- Para producción: no recomendable sin una evaluación exhaustiva propia, revisión legal de licencias y validación de sesgos y robustez.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-governed-distill-27b-qlora-r1
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.8-27B
- PEFT (librería): https://github.com/huggingface/peft
- TRL (librería): https://github.com/huggingface/trl
- Referencia citada en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental: https://mlco2.github.io/impact
