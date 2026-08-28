# XeroGhost/green-ai-carbon-audit

## Resumen

Este repositorio no contiene un modelo de inteligencia artificial funcional, sino un registro de auditoría de emisiones de carbono asociado a un entrenamiento de GPU. El autor, XeroGhost, documenta el coste energético y las emisiones de CO₂ equivalente de un proceso de pre-entrenamiento realizado con 8 GPUs NVIDIA A100 en la región us-east1. La información se presenta en formato de model card, incluyendo el cálculo detallado de energía consumida (856,55 kWh) y emisiones generadas (359,751 kg CO₂eq), basado en valores de referencia de TDP, intensidad de red y PUE.

Este tipo de documentación es relevante en el contexto actual de la IA sostenible, donde cada vez se exige mayor transparencia sobre el impacto ambiental del entrenamiento de modelos. Aunque no aporta capacidades de procesamiento de lenguaje o visión, sirve como ejemplo de buenas prácticas para la contabilidad de carbono en proyectos de IA. El repositorio tiene cero descargas y cero likes, y fue creado el 28 de agosto de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se incluyen pesos) |

## Arquitectura y entrenamiento

No se describe ninguna arquitectura de red neuronal, ya que este repositorio no contiene un modelo entrenado. La información se limita a un registro de ejecución de pre-entrenamiento con los siguientes datos: 8 GPUs NVIDIA A100, 176,1 horas de GPU, región us-east1, PUE de 1,52 y tipo de entrenamiento pre-training. El cálculo de emisiones se realiza mediante la fórmula estándar que multiplica la potencia TDP (400 W por GPU) por el número de GPUs, las horas de uso y el PUE, dividido entre 1000 para obtener kWh. Posteriormente se multiplica por la intensidad de red de us-east1 (420 gCO₂eq/kWh) para obtener los kilogramos de CO₂ equivalente. No se menciona el uso de técnicas como RLHF, DPO ni ninguna innovación técnica en el entrenamiento.

## Capacidades

- No es un modelo de IA: no genera texto, código, imágenes ni realiza razonamiento.
- Proporciona un registro verificable de emisiones de carbono para un entrenamiento específico.
- Documenta el hardware utilizado, la duración, la región y el PUE.
- Ofrece un cálculo reproducible paso a paso del coste energético y las emisiones.
- Puede servir como referencia para auditorías ambientales de proyectos de IA.
- No incluye herramientas de inferencia, tool calling ni capacidades multilingües.

## Casos de uso

- Verificación de cumplimiento ambiental: organizaciones que necesiten demostrar el impacto de sus entrenamientos pueden usar este tipo de registro como evidencia documental.
- Investigación en IA sostenible: permite comparar el coste energético de diferentes configuraciones de hardware y regiones.
- Educación y divulgación: sirve como ejemplo didáctico para explicar cómo calcular la huella de carbono de un entrenamiento de modelos.
- Auditoría interna de proyectos de IA: los equipos pueden replicar esta metodología para registrar sus propias emisiones.
- Comparación de proveedores cloud: la elección de región (us-east1) y hardware (A100) influye en las emisiones; este tipo de datos ayuda a tomar decisiones informadas.
- Documentación de modelos publicados: integrar esta información en las model cards de modelos reales para cumplir con estándares de transparencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible, ya que el repositorio no contiene un modelo evaluable. No se proporcionan métricas de precisión, latencia ni throughput.

## Requisitos de hardware

- El entrenamiento registrado utilizó 8 GPUs NVIDIA A100 (TDP 400 W cada una).
- El consumo energético total fue de 856,55 kWh durante 176,1 horas de GPU.
- Las emisiones asociadas fueron de 359,751 kg CO₂eq, calculadas con una intensidad de red de 420 gCO₂eq/kWh para us-east1.
- No se especifican requisitos de VRAM para inferencia, ya que no hay modelo.
- Para reproducir el cálculo, solo se necesitan los datos de hardware, tiempo y región.
- No se indican opciones de despliegue (vLLM, llama.cpp, etc.) porque no hay modelo que servir.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA comparable con otros modelos de lenguaje o visión. Existen otros repositorios con el mismo nombre (por ejemplo, Bk-1928/green-ai-carbon-audit y 24f1002802/green-ai-carbon-audit) que documentan auditorías de otros entrenamientos, pero no son modelos funcionales. La comparación entre ellos se limitaría a los valores de emisiones y hardware, no a capacidades de IA.

## Limitaciones y advertencias

- El repositorio no contiene un modelo utilizable; es solo un registro de metadatos.
- Los cálculos de emisiones se basan en valores de referencia estándar (TDP, intensidad de red) que pueden no reflejar el consumo real medido.
- La licencia no está especificada, por lo que el uso comercial del contenido no está claramente permitido.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones de idioma porque no hay modelo.
- Para producción, este repositorio no ofrece ninguna funcionalidad; es únicamente documentación ambiental.
- La fecha de creación (2026) y la ausencia de descargas sugieren que es un proyecto reciente y sin validación externa.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/XeroGhost/green-ai-carbon-audit
- Repositorio similar de Bk-1928: https://huggingface.co/Bk-1928/green-ai-carbon-audit
- Repositorio similar de 24f1002802: https://huggingface.co/24f1002802/green-ai-carbon-audit/tree/main
- Artículo de referencia sobre IA verde: https://arxiv.org/abs/2404.01157
- Página de recursos Green AI: https://ejhusom.github.io/green-ai/
