# yujackein/onereason-8b-lora-item32k-user100-rec50-worldclean1601-all1-lr2e4-r32a32-seq32768-gbs4-1epoch

## Resumen

Este repositorio contiene un adaptador LoRA experimental para el modelo base `OpenOneRec/OneReason-8B-pretrain-competition`, desarrollado por el usuario `yujackein` como parte de la competición OneReason de recomendación generativa. El adaptador se entrenó con una receta de datos ampliada que incluye filas oficiales de evolución R2, además de las categorías R0, R3 y datos mundiales limpios de C-Eval, sumando un total de 90 583 filas y aproximadamente 199 millones de tokens renderizados. El objetivo es mejorar la capacidad del modelo base para razonar y generar recomendaciones personalizadas en contextos largos de hasta 32 768 tokens.

El adaptador se publica bajo la librería PEFT con pesos en formato safetensors y está diseñado para ser cargado sobre el modelo base mediante `PeftModel`. Aunque el modelo base es de 8 000 millones de parámetros, el adaptador en sí es ligero (0,4 GB) y se puede integrar fácilmente en pipelines de generación de texto. La relevancia de esta publicación radica en que documenta un experimento de entrenamiento con un lote global de 4 (GBS4) completado, frente a un intento abortado con GBS16, y proporciona detalles precisos sobre la configuración y los datos utilizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre OneReason-8B (base transformer) |
| Parametros totales | no disponible (modelo base de 8B; adaptador LoRA de 0,4 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32 768 |
| Tipos de cuantizacion | no disponible (entrenado en BF16, sin cuantizacion publicada) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en el modelo `OpenOneRec/OneReason-8B-pretrain-competition`, un transformer de 8 000 millones de parámetros orientado a razonamiento y recomendación generativa. El método de ajuste es LoRA con rango `r=32`, alpha `alpha=32` y dropout de 0,05, aplicado a los módulos de atención y MLP (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). El entrenamiento se realizó en precisión BF16 con una longitud de contexto de 32 768 tokens, utilizando 4 GPUs NVIDIA A800 de 80 GB, un tamaño de micro lote de 1 por GPU y un lote global de 4 sin acumulación de gradientes. La tasa de aprendizaje fue de `2e-4` con programación coseno y un calentamiento del 3 %. Se completó una pasada de empaquetado seguro con 1 621 actualizaciones de optimizador, alcanzando una pérdida final de 0,9797 y una pérdida media de 0,9248 en los últimos 100 pasos.

El conjunto de datos combina 32 000 filas de percepción R0, 32 848 filas de evolución R2, 24 134 filas de recomendación R3 y 1 601 filas de datos mundiales limpios de C-Eval, con un total de 90 583 filas y 199 293 773 tokens renderizados. Todas las filas tienen un peso de pérdida de asistente de 1,0 y ninguna supera el límite de 32 768 tokens. El plan de empaquetado de cuatro rangos consume el 99,2838 % de los tokens renderizados en una sola pasada segura.

## Capacidades

- Generacion de texto y razonamiento: el modelo base está diseñado para tareas de razonamiento, y el adaptador refuerza su capacidad para generar recomendaciones justificadas.
- Recomendacion generativa: entrenado específicamente con datos de recomendación (R0, R2, R3), puede producir recomendaciones personalizadas en formato conversacional.
- Soporte multilingue: entrenado en chino e inglés, lo que permite su uso en ambos idiomas.
- Contexto largo: con 32 768 tokens de ventana, puede manejar historiales de usuario extensos y documentos largos.
- Integracion con PEFT: al ser un adaptador LoRA, se puede cargar y descargar dinámicamente sobre el modelo base sin necesidad de reentrenar.
- No se han documentado capacidades adicionales como tool calling, agentes o visión; el modelo es puramente de texto.

## Casos de uso

- Sistemas de recomendacion conversacional: el modelo puede mantener diálogos multi-turno con el usuario, entendiendo sus preferencias a lo largo de una conversación y sugiriendo productos o contenidos de forma natural, gracias a su contexto de 32 768 tokens.
- Asistentes de compra personalizados: en plataformas de e-commerce, puede analizar el historial de compras y navegación del usuario (codificado en las filas R2) para generar recomendaciones razonadas y explicar el porqué de cada sugerencia.
- Analisis de preferencias de usuario: a partir de datos de percepción (R0) y evolución (R2), el modelo puede inferir cambios en los intereses del usuario y adaptar sus recomendaciones en consecuencia.
- Generacion de explicaciones de recomendaciones: en lugar de solo listar ítems, el modelo puede redactar explicaciones textuales que justifiquen cada recomendación, mejorando la transparencia y confianza del sistema.
- Investigacion en recomendacion generativa: sirve como base para experimentos académicos sobre cómo los modelos de lenguaje generan recomendaciones con razonamiento, dado que está diseñado específicamente para la competición OneReason.
- Fine-tuning adicional para dominios especificos: al ser un adaptador LoRA ligero, se puede combinar con otros adaptadores o ajustar sobre conjuntos de datos propietarios para tareas de recomendación en sectores como streaming, noticias o viajes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una puntuación de `1.2303` perteneciente a un modelo de referencia con receta User75, pero aclara explícitamente que ese valor no corresponde a este adaptador (User100). Por tanto, no hay datos de rendimiento cuantitativo para este adaptador específico.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 8 000 millones de parámetros. En BF16, ocupa aproximadamente 16 GB de VRAM, más el adaptador (0,4 GB). Con cuantización de 4 bits, la VRAM podría reducirse a unos 6-8 GB, aunque no se han publicado configuraciones oficiales de cuantización.
- GPU recomendadas: para inferencia en BF16 se recomienda una GPU con al menos 24 GB de VRAM, como RTX 3090, RTX 4090 o A10G. Para entrenamiento se utilizaron 4 x A800 80GB, pero para inferencia una sola GPU de 24 GB es suficiente.
- Compatibilidad con GPU de consumo: sí, es posible ejecutar el modelo en GPUs de consumo con 24 GB (por ejemplo, RTX 3090/4090) usando BF16. Con cuantización 4-bit, podría caber en GPUs de 12 GB como RTX 3060 o RTX 4070.
- Opciones de despliegue: al ser un modelo de HuggingFace con PEFT, se puede desplegar con `transformers` y `peft`, o mediante servidores de inferencia como vLLM (si se fusiona el adaptador con el modelo base) o TGI. También se puede usar con `llama.cpp` si se convierte a GGUF, aunque no se ha publicado esa conversión.
- Latencia y throughput: no hay datos publicados. En una A100 80GB, un modelo de 8B en BF16 suele generar entre 20 y 50 tokens por segundo, dependiendo del hardware y la implementación.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos comparables en la misma categoría (recomendación generativa con LoRA sobre OneReason-8B) dentro de la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un adaptador entrenado con datos específicos de la competición OneReason, puede presentar sesgos derivados del dominio de los datos (recomendaciones de productos, evolución de usuarios) y no generalizar bien fuera de ese ámbito.
- Riesgo de alucinacion: como todo modelo generativo, puede producir recomendaciones o explicaciones plausibles pero incorrectas, especialmente en contextos largos o con información ambigua.
- Limitaciones de contexto e idioma: aunque soporta chino e inglés, no se ha evaluado su rendimiento en otros idiomas. El contexto máximo es de 32 768 tokens, por lo que entradas más largas serán truncadas.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede determinar si es apto para uso comercial. Se recomienda contactar al autor antes de cualquier uso productivo.
- Dependencia del modelo base: el adaptador requiere el modelo base `OpenOneRec/OneReason-8B-pretrain-competition`, que también puede tener sus propias limitaciones y requisitos de licencia.
- Advertencia de producción: es un adaptador experimental, entrenado para una competición, sin evaluación formal de calidad. No se recomienda su uso en entornos de producción sin una validación exhaustiva.

## Enlaces

- [Adaptador LoRA en HuggingFace](https://huggingface.co/yujackein/onereason-8b-lora-item32k-user100-rec50-worldclean1601-all1-lr2e4-r32a32-seq32768-gbs4-1epoch)
- [Modelo base OneReason-8B](https://huggingface.co/OpenOneRec/OneReason-8B-pretrain-competition)
