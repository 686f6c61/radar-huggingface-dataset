# wz7475/qwen2.5-7b-instruct-katcher-legal-lwf-oasst1-kw1.25-every1

## Resumen

El modelo `wz7475/qwen2.5-7b-instruct-katcher-legal-lwf-oasst1-kw1.25-every1` es un artefacto publicado en Hugging Face por el usuario wz7475. Su model card es la plantilla genérica autogenerada por la plataforma y no tiene un solo campo cumplimentado: no declara autoría, tipo de modelo, idiomas, licencia, datos de entrenamiento ni procedimiento de ajuste. Toda la información verificable se reduce al identificador, a las etiquetas del repositorio (`transformers`, `safetensors`, `arxiv:1910.09700`, `endpoints_compatible`, `region:us`) y a un tamaño de repositorio de 0,3 GB.

Del nombre puede inferirse, con muchas reservas, que se trata de una derivación de Qwen2.5-7B-Instruct (transformer decoder-only de 7.610 millones de parámetros, contexto nativo de 131.072 tokens y licencia Apache-2.0 en su variante de 7B). El sufijo sugiere una intervención doble: un componente orientado a dominio legal (`katcher-legal`) y una mezcla con el corpus OASST1 (`oasst1`), con algún esquema de ponderación (`kw1.25`) y una política de aplicación por capas (`lwf`, `every1`). Nada de esto está documentado.

La relevancia práctica del modelo hoy es escasa: cero descargas, cero «likes», ficha vacía y 0,3 GB de repositorio, cifra incompatible con los aproximadamente 15 GB que ocuparían 7,6 mil millones de parámetros en bf16. Eso apunta a un adaptador LoRA, a un delta de pesos o a una subida incompleta, y obliga a inspeccionar el repositorio antes de plantear cualquier uso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible. El identificador remite a Qwen2.5-7B-Instruct (transformer decoder-only con atención GQA), pero la ficha no lo confirma |
| Parámetros totales | no disponible. La familia base Qwen2.5-7B declara 7.610 millones; el repositorio ocupa 0,3 GB, incompatible con pesos completos en bf16 |
| Parámetros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible. La familia Qwen2.5-7B-Instruct soporta 131.072 tokens, dato no verificado para este derivado |
| Tipos de cuantización | no disponible. Solo hay safetensors en el repositorio; no se publican GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | no disponible |
| Licencia | no disponible. La ficha no declara licencia; la del modelo base Qwen2.5-7B-Instruct es Apache-2.0, pero la del derivado no se especifica |
| Formato de pesos | safetensors (etiqueta del repositorio). No se detalla si son pesos completos, un adaptador o un delta |

## Arquitectura y entrenamiento

No hay información sobre arquitectura ni entrenamiento en la documentación publicada. La etiqueta `arxiv:1910.09700` no referencia un artículo sobre el modelo: corresponde a Lacoste et al. (2019), el trabajo sobre estimación de emisiones de carbono que aparece citado en la plantilla por defecto de las model cards de Hugging Face. Es, por tanto, un artefacto de la plantilla y no una fuente técnica.

Si se acepta la hipótesis del identificador, el proceso sería un ajuste fino o una fusión de pesos sobre Qwen2.5-7B-Instruct combinando un corpus legal con OpenAssistant/oasst1, aplicando una ponderación de 1,25 y una aplicación cada capa (`every1`). La abreviatura `lwf` admitiría al menos dos lecturas, «learning without forgetting» o una fusión por capas, sin que haya forma de confirmarlo. Tampoco consta número de tokens, composición del dataset, ni si hubo RLHF, DPO o simple SFT supervisado.

## Capacidades

Las capacidades del modelo no están documentadas en la información disponible. Si finalmente se confirma que deriva de Qwen2.5-7B-Instruct, cabría esperar las de la familia base, siempre sujetas a verificación empírica:

- Generación de texto, razonamiento de varios pasos y comprensión lectora.
- Generación y explicación de código, con soporte de relleno intermedio en la familia base.
- Matemáticas y aritmética de nivel medio.
- Tool calling y function calling en formato estructurado.
- Capacidades multilingües de la familia Qwen2.5 (una treintena de idiomas), con calidad desigual.
- Manejo de entradas largas, hasta 131.072 tokens en la familia base.

No consta ningún modo de razonamiento explícito, soporte de visión, audio ni una ventana de contexto específica declarada para este derivado.

## Casos de uso

Todos los escenarios son hipotéticos y requieren validación previa, dado que no existe documentación ni evaluación publicada.

- Extracción estructurada de cláusulas contractuales: dado un contrato, devolver un JSON con partes, plazos, penalizaciones y condiciones de resolución, usando tool calling para persistir el resultado en una base de datos.
- Comparación de versiones de contratos: aprovechar una ventana larga para alinear cláusula a cláusula dos documentos y señalar adiciones, supresiones y cambios de redacción.
- Asistente de primera línea en un despacho: responder consultas frecuentes con recuperación aumentada sobre la base documental interna, derivando a un profesional cuando la confianza sea baja.
- Clasificación y enrutado de consultas legales: etiquetar por materia (laboral, mercantil, fiscal) y prioridad para distribuirlas entre equipos.
- Redacción de borradores de escritos y comunicaciones: generar una primera versión siempre con revisión humana obligatoria y trazabilidad de fuentes.
- Detección y anonimización de entidades: identificar nombres, DNI, direcciones e importes en textos jurídicos antes de almacenarlos.
- Medición de olvido catastrófico: si la intervención buscaba preservar capacidades generales, este modelo serviría como sujeto de un estudio comparativo frente al modelo base.
- Ajuste adicional con LoRA: punto de partida para especializar sobre el corpus interno de una organización, si la licencia y la procedencia de los datos lo permiten.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La sección de evaluación de la model card está sin rellenar y el repositorio no incluye informes, tablas de resultados ni scripts de evaluación. En consecuencia, no es posible afirmar que el ajuste legal haya mejorado el rendimiento en tareas jurídicas ni cuantificar el posible deterioro en capacidades generales.

## Requisitos de hardware

Estimaciones derivadas del recuento de parámetros del modelo base, no medidas sobre este artefacto.

| Precisión | VRAM estimada | GPU de referencia | ¿Cabe en GPU de consumo? |
|---|---|---|---|
| bf16 / fp16 | 16-18 GB | A100 40 GB, H100, L40S | Sí, en RTX 4090 o RTX 3090 (24 GB) con margen ajustado |
| int8 | 9-10 GB | L4, A10G, RTX 4090 | Sí, RTX 4080/4090, RTX 3090 |
| int4 (GPTQ, AWQ, GGUF Q4) | 5-6 GB | RTX 3060 12 GB, RTX 4060 Ti 16 GB | Sí, en la mayoría de GPU con 8-12 GB |
| CPU / Apple Silicon | 6-10 GB de memoria unificada | M1/M2/M3 con 16 GB o más | Vía llama.cpp u Ollama |

- Si el repositorio contiene solo un adaptador, habrá que sumar los requisitos del modelo base.
- Si contiene un delta de pesos, la memoria necesaria es la del modelo base.
- Opciones de despliegue: vLLM y TGI para safetensors; llama.cpp, Ollama o LM Studio solo tras convertir a GGUF, conversión que no está publicada; `transformers` con PEFT si resulta ser un adaptador.
- No hay datos medidos de latencia, throughput ni tamaño de lote recomendado.

## Comparativa con modelos similares

Los datos del modelo evaluado no son verificables, por lo que la comparación se establece contra las alternativas de su categoría con las cifras que figuran en sus fichas oficiales.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| qwen2.5-7b-instruct-katcher-legal-lwf-oasst1-kw1.25-every1 | no disponible | no disponible | no disponible | 0 descargas, repositorio de 0,3 GB |
| Qwen2.5-7B-Instruct | 7,61 B | 131.072 tokens | Apache-2.0 | Pesos bf16 publicados, ampliamente desplegado |
| Llama 3.1 8B Instruct | 8,03 B | 131.072 tokens | Llama 3.1 Community License | Requiere aceptar términos; uso comercial con condiciones |
| Mistral 7B Instruct v0.3 | 7,25 B | 32.768 tokens | Apache-2.0 | Contexto más corto, ecosistema maduro |

Las cifras de los tres modelos de referencia proceden de sus documentación pública y deben verificarse en el momento de la consulta; se incluyen como orientación y no implican ninguna medición sobre el modelo evaluado, del que no existe siquiera confirmación de arquitectura.

## Limitaciones y advertencias

- Ficha técnica vacía: no hay información sobre datos de entrenamiento, procedencia, filtrado ni posible contaminación de evaluación.
- Licencia no declarada: sin licencia explícita no puede asumirse permiso de uso comercial, y el hecho de que la base sea Apache-2.0 no se hereda automáticamente para el derivado.
- Procedencia incierta del corpus legal: si se entrenó con textos jurídicos, la titularidad y el tratamiento de datos personales quedan sin documentar.
- Riesgo alto de alucinación en materia jurídica: sin evaluación publicada no hay garantía de que el modelo cite normativa vigente ni de que respete la jurisdicción correcta.
- Posible olvido catastrófico: una fusión con ponderación 1,25 sobre un dominio específico puede degradar el rendimiento general del modelo base.
- Riesgo de sesgo: sin evaluación de sesgos no puede descartarse un desequilibrio hacia determinadas jurisdicciones, lenguas o tipos de cliente.
- Idiomas no declarados: el castellano de España podría no estar cubierto con calidad suficiente.
- Repositorio de 0,3 GB: existe una probabilidad real de que el artefacto esté incompleto o no sea cargable directamente con `from_pretrained` sin el modelo base.
- Fecha de publicación registrada como 2026-10-05, posterior a la creación de la familia base; conviene comprobar la coherencia temporal del repositorio.
- Sin métricas, sin pruebas y con cero descargas, no es apto para producción sin una validación interna completa.
- Recomendación: inspeccionar el contenido del repositorio (claves `config.json`, `adapter_config.json`, número de archivos `.safetensors`) antes de cualquier evaluación.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/wz7475/qwen2.5-7b-instruct-katcher-legal-lwf-oasst1-kw1.25-every1
- Artículo citado en las etiquetas del repositorio: https://arxiv.org/abs/1910.09700 (Lacoste et al., 2019, sobre estimación de emisiones; aparece en la plantilla por defecto de Hugging Face y no describe este modelo)
- Familia base presumible, Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Corpus presumible, OpenAssistant/oasst1: https://huggingface.co/datasets/OpenAssistant/oasst1
- Documentación de transformers: https://huggingface.co/docs/transformers
- Calculadora de impacto de carbono en aprendizaje automático: https://mlco2.github.io/impact
