# speakleash/Bielik-One-11B-v3.0-r1-Adapter

## Resumen

Bielik-One-11B-v3.0-r1-Adapter es un paquete de despliegue para vLLM que convierte el modelo conversacional Bielik-11B-v3.0-Instruct de SpeakLeash en un modelo de decisión estructurada. Se distribuye como un adaptador LoRA de aproximadamente 1,1 GB junto con cabeceras de decisión separadas, que se cargan mediante un plugin de vLLM sobre los pesos base sin modificar. El modelo base lo desarrolla SpeakLeash, un consorcio polaco centrado en modelos de lenguaje de código abierto para lenguas eslavas y europeas.

El problema que resuelve es concreto: en lugar de generar texto libre, el modelo devuelve decisiones tipadas y probabilidades calibradas para preguntas de clasificación, binarias, de puntuación ordinal y de etiquetado múltiple. Esto lo hace útil para sistemas que necesitan salidas estructuradas y auditables (enrutamiento, evaluación de casos, extracción de estados) sin renunciar al modelo base para el chat ordinario, ya que ambos comparten los mismos pesos en una sola GPU.

La relevancia actual del paquete es su eficiencia de despliegue: añade solo unos 1,0 GB de memoria GPU sobre una implementación de Bielik-11B-v3.0-Instruct ya existente, frente a los aproximadamente 21 GB que requeriría una copia completa del modelo fusionado. La licencia es Apache 2.0 y el contexto configurado por defecto es de 32.768 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer (modelo base Bielik-11B-v3.0-Instruct) con cabeceras de decisión separadas y plugin de vLLM |
| Parametros totales | 11B (modelo base); el adaptador ocupa aproximadamente 1,1 GB en disco |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (perfil por defecto) |
| Tipos de cuantizacion | bfloat16 (por defecto, calibrado); FP8 mediante `--fp8` (reduce a la mitad la memoria de pesos, no calibrado) |
| Idiomas soportados | Multilingüe: pl, en, sq, bel, bs, bg, hr, cs, da, et, fi, fr, el, es, is, lt, nl, de, no, pt, ru, ro, sr, hbs, sv, sk, sl, tr, uk, hu, it, lv |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA); requiere el modelo base en safetensors |

## Arquitectura y entrenamiento

El paquete no es un modelo independiente, sino una capa de decisión sobre el transformer Bielik-11B-v3.0-Instruct. La arquitectura combina un adaptador LoRA (aproximadamente 1,0 GB de memoria GPU) con cabeceras de decisión dedicadas que se cargan mediante un plugin de vLLM (`systemone-vllm-heads`). Los pesos base permanecen sin modificar y se comparten entre la ruta de chat y la ruta de decisión en un mismo motor, lo que permite servir ambas capacidades simultáneamente sin duplicar el modelo.

El sistema soporta cuatro tipos de pregunta: `choice` (selección entre opciones con clave), `noul` (probabilidad binaria de sí), `score` (nivel ordinal esperado con leyenda) y `labels` (probabilidad independiente por etiqueta con umbral de 0,5). La calibración se ajusta únicamente sobre el split de validación, con una temperatura por tipo de pregunta: choice T=1,899, binaria T=1,803, score T=2,594 y labels T=1,129. La calibración no altera las decisiones por argmax ni por umbral de 0,5. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Decisión estructurada tipada: clasificación por elección, preguntas binarias, puntuación ordinal y etiquetado múltiple con probabilidades por opción y nivel de confianza.
- Salidas calibradas: temperaturas por tipo de pregunta ajustadas en validación, con opción de desactivar la calibración (`--no-calibration` o `"temperature": 1`).
- Chat conversacional: la ruta `bielik-base` mantiene intactas las capacidades del modelo base Bielik-11B-v3.0-Instruct.
- Soporte multilingüe en 30 idiomas, con foco declarado en polaco e inglés y cobertura de lenguas eslavas y europeas.
- Servicio mediante API compatible con el esquema de OpenAI en `/v1/chat/completions` y endpoint propio `/v1/systemone` para decisiones.
- Interfaz interactiva de esquema en `/docs`.
- Caché de prefijos, modo eager y procesamiento por lotes configurable (8 secuencias, 2.048 tokens por lote por defecto).
- No se ha documentado soporte de tool calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo puede clasificar cada incidencia con preguntas de tipo `choice` (categoría) y `score` (urgencia) sobre el texto del ticket, devolviendo probabilidades calibradas que permiten fijar umbrales de escalado automático.
- Evaluación de riesgo en cobros y facturación: con un estado textual (factura, importe, plazo, historial), el modelo responde a preguntas binarias (`noul`) y de etiquetado (`labels`) para decidir si enviar recordatorio, aplicar intereses o cancelar, como muestra el ejemplo de la model card.
- Moderación y cumplimiento normativo: clasificación de contenido con etiquetas múltiples independientes y umbral de 0,5, útil para pipelines que necesitan decisiones auditables con probabilidad asociada en lugar de texto generado.
- Triaje en atención al cliente: combinación de chat con el modelo base y decisiones tipadas en el mismo motor, de modo que una conversación multi-turno puede derivar en una decisión estructurada (categoría, prioridad, acción) sin cambiar de infraestructura.
- Extracción de estados en documentos: dado un texto de contexto largo (hasta 32.768 tokens), el modelo responde a un conjunto de preguntas tipadas definidas por el integrador, adecuado para procesar contratos, reclamaciones o informes.
- Sistemas de decisión con calibración: al disponer de temperaturas ajustadas por tipo de pregunta, el modelo sirve para umbrales operativos donde la probabilidad debe ser interpretable, como scoring ordinal de riesgo o selección de acciones con probabilidad mínima.
- Despliegue incremental sobre infraestructura existente: si ya se sirve Bielik-11B-v3.0-Instruct con vLLM, añadir este paquete cuesta aproximadamente 1,0 GB de VRAM adicional, lo que permite incorporar decisiones tipadas sin un segundo modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 30 GB para el modelo de 11B (pesos más caché KV configurada). Con `--fp8` la memoria de pesos se reduce aproximadamente a la mitad, aunque la calibración no está ajustada para FP8.
- Coste incremental del adaptador: aproximadamente 1,0 GB de memoria GPU sobre una implementación ya existente del modelo base; una copia fusionada completa requeriría unos 21 GB adicionales.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; por el consumo de 30 GB en bfloat16, encajan GPU de 40 GB o más (A100 40/80 GB, H100) y, con FP8, opciones de 24 GB podrían ser viables, aunque no está confirmado.
- Despliegue: vLLM 0.32.0 como perfil por defecto, con el plugin `systemone-vllm-heads` y el paquete `bielik-one` (backend y frontend). No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La configuración por defecto usa 8 secuencias, 2.048 tokens por lote, caché de prefijos y modo eager.
- Requisito de acceso: el modelo base está restringido en Hugging Face; es necesario aceptar las condiciones y autenticarse con `hf auth login` o `HF_TOKEN`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bielik-One-11B-v3.0-r1-Adapter | 11B (base) + LoRA ~1,1 GB | 32.768 | Decisiones tipadas calibradas sobre vLLM | Apache 2.0 | Hugging Face (requiere acceso al base) |
| Bielik-11B-v3.0-Instruct | 11B | No disponible en la información | Chat instructivo general | No disponible en la información | Hugging Face (con acceso restringido) |
| Bielik-One-11B-v3.0-r1 (fusionado) | 11B | No disponible en la información | Mismo modelo de decisión en checkpoint único | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El endpoint `decision` no debe usarse para generación de texto libre; está diseñado exclusivamente para decisiones tipadas.
- La calibración está ajustada en bfloat16 y no es válida para el modo `--fp8`, que además altera algunas decisiones cerca del límite de decisión.
- La calibración no modifica las decisiones por argmax ni por umbral de 0,5; solo afecta a las probabilidades reportadas.
- El modelo base está restringido en Hugging Face y requiere aceptar condiciones y autenticación previa.
- No se dispone de información sobre sesgos, tasa de alucinación ni evaluación de robustez en la documentación proporcionada.
- El rendimiento en idiomas distintos del polaco e inglés no está cuantificado en la información disponible, pese a la amplia lista de idiomas declarada.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia y condiciones del modelo base, del que no se detalla licencia en la información proporcionada.
- El paquete depende de versiones concretas (vLLM 0.32.0 y el plugin de cabeceras); cambios de versión pueden afectar al comportamiento.
- Para solicitudes sobre datos personales o derechos de autor, el autor indica el contacto biuro@speakleash.org.pl.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/speakleash/Bielik-One-11B-v3.0-r1-Adapter
- Modelo base: https://huggingface.co/speakleash/Bielik-11B-v3.0-Instruct
- Versión fusionada: https://huggingface.co/speakleash/Bielik-One-11B-v3.0-r1
- Repositorio del proyecto: https://github.com/speakleash/bielik-one
- Plugin de cabeceras para vLLM: https://github.com/speakleash/bielik-one#subdirectory=vllm-heads-plugin
- Contacto del autor: biuro@speakleash.org.pl
