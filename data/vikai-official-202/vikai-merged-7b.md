# vikai-official-202/vikai-merged-7b

## Resumen

vikai-merged-7b es un modelo de lenguaje de 7.612.756.480 parámetros publicado por vikai-official-202 en Hugging Face. No es un entrenamiento desde cero: se ha generado mediante una fusión SLERP con mergekit a partir de Qwen/Qwen2.5-Math-7B-Instruct y un checkpoint local denominado `/content/merge/vikai-s1`. Conserva la arquitectura Qwen2 y el pipeline de text-generation, con pesos en safetensors y dtype bfloat16.

El interés práctico está en obtener una variante conversacional orientada a matemáticas e instrucciones sin asumir el coste de un entrenamiento completo, reutilizando el conocimiento del modelo base. Sin embargo, la model card es mínima: no documenta datos de entrenamiento, idiomas, longitud de contexto, licencia ni evaluaciones. Por tanto, debe tratarse como un experimento de fusión reproducible solo parcialmente, no como un modelo listo para producción sin validación.

Es relevante para quienes experimentan con mergekit y quieren comparar fusiones SLERP sobre Qwen2.5-Math, pero no aporta garantías técnicas adicionales. La ausencia de licencia y de benchmarks obliga a verificar derechos de uso y calidad antes de integrarlo en cualquier sistema.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2, según los tags `qwen2` y el modelo base |
| Parámetros totales | 7.612.756.480 |
| Parámetros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el repositorio publica pesos en bfloat16 y safetensors. No se documentan variantes GGUF, AWQ, GPTQ ni otras |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, bfloat16 |
| Modelo base | Qwen/Qwen2.5-Math-7B-Instruct |
| Método de fusión | SLERP con mergekit |
| Tamaño del repositorio | 15,2 GB |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2, un transformer decoder-only denso, según los tags del repositorio y el modelo base declarado. El modelo no se ha entrenado desde cero: se ha construido mediante una interpolación esférica de pesos SLERP entre Qwen/Qwen2.5-Math-7B-Instruct y el checkpoint local `/content/merge/vikai-s1`. La configuración indica `dtype: bfloat16`, `out_dtype: bfloat16`, `tokenizer.source: union` y coeficientes `t: [0.0, 0.15, 0.25, 0.25, 0.15, 0.0]`.

No se documentan datos de entrenamiento, número de tokens, composición del dataset, RLHF, DPO ni evaluaciones posteriores a la fusión. El checkpoint `vikai-s1` no está enlazado públicamente en la información disponible, lo que limita la reproducción exacta del merge. La innovación técnica se reduce al propio proceso de fusión SLERP; no se describen decodificación especulativa, attention linear ni otras modificaciones arquitectónicas.

## Capacidades

- Generación de texto: pipeline `text-generation` y tag `conversational`, orientado a respuestas en formato conversacional.
- Razonamiento matemático e instrucciones: hereda la orientación del modelo base Qwen2.5-Math-7B-Instruct, aunque no hay benchmarks de esta fusión que confirmen su rendimiento.
- Resolución de problemas paso a paso: capacidad esperable por el modelo base, pero no evaluada en esta variante.
- Soporte de tool calling o function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles; no se especifican idiomas.
- Contexto largo: no disponible; no se documenta la ventana máxima.
- Modalidades: solo texto; no se documentan visión, audio ni otras entradas multimodales.
- Modo thinking explícito: no documentado.

## Casos de uso

- Tutoría matemática conversacional: puede explicar pasos y responder preguntas sobre ejercicios gracias a su base Qwen2.5-Math-7B-Instruct; requiere revisión humana por la falta de benchmarks y de evaluación de sesgos.
- Generación de problemas y soluciones para plataformas educativas: el modelo base está especializado en matemáticas, por lo que sirve para producir borradores de enunciados y soluciones; conviene filtrar los resultados con un verificador simbólico.
- Asistente de apoyo en cursos de cálculo, álgebra o estadística: el tag `conversational` y el pipeline `text-generation` permiten diálogos multi-turno, aunque la longitud de contexto no está documentada y deben probarse sesiones cortas.
- Prototipado de razonamiento cuantitativo en investigación: útil para comparar una fusión SLERP frente al modelo base en tareas de instrucciones matemáticas; no hay métricas publicadas que garanticen una mejora.
- Generación de documentación técnica con fórmulas: puede redactar explicaciones y pasos intermedios; debe validarse la exactitud numérica y no se confirma soporte de tool calling para cálculo externo.
- Experimentación con mergekit: sirve como caso de estudio reproducible parcialmente para evaluar cómo afectan los coeficientes SLERP a un modelo Qwen2.5-Math; la falta del checkpoint `vikai-s1` limita la reproducción exacta.
- Fine-tuning para dominios cuantitativos: al ser un transformer denso de 7,6B con pesos safetensors, puede adaptarse con transformers si la licencia lo permite; la licencia no está disponible, así que no debe asumirse uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K, MATH ni comparaciones verificadas para esta fusión.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 15,2 GB solo para los pesos; con caché KV y overhead, un despliegue real puede requerir del orden de 17-22 GB para lote pequeño y contexto moderado. Es una estimación genérica, no validada para
