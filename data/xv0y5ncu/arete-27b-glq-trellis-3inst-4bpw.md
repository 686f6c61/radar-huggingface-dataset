# xv0y5ncu/Arete-27B-GLQ-trellis-3inst-4bpw

## Resumen

Arete-27B-GLQ-trellis-3inst-4bpw es una cuantización de 4 bits por peso del modelo NousResearch/Arete-27B, publicada por el usuario xv0y5ncu. El modelo base es, según la model card, un Qwen3.8-27B sometido a un ajuste fino supervisado (SFT) orientado a alineamiento de valores sobre el dataset NousResearch/arete-data-pairs, manteniendo la arquitectura original intacta. Esta versión aplica GLQ (trellis-coded quantization con la variante QTIP TCQ `3inst`, transformada de Hadamard aleatorizada y LDLQ) para comprimir los pesos del decodificador de texto a 4,0 bits/peso, decodificándolos al vuelo mediante kernels CUDA fusionados.

La relevancia de esta ficha está en el método de compresión: GLQ busca maximizar la relación tamaño-precisión en el rango de 2 a 4 bits/peso, y este checkpoint se sitúa exactamente en ese intervalo con un SQNR medio de pesos de 22,00 dB sobre 400 capas cuantizadas. Los pesos permanecen comprimidos en memoria, lo que reduce el espacio ocupado respecto a un bf16 equivalente, a costa de requerir el runtime `glq` (versión 0.7.0 o superior) y kernels CUDA específicos.

El modelo es multimodal de entrada (image-text-to-text) según sus tags, aunque GLQ solo cuantiza el decodificador de texto: las torres de visión y audio se conservan en su formato nativo. La model card recomienda vLLM como runtime de referencia y advierte de que el contexto largo es costoso en memoria: una secuencia de 262.144 tokens requiere unos 16,3 GiB de caché KV adicionales sobre los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.8-27B, sin cambios respecto al base); decodificador de texto cuantizado con GLQ |
| Parametros totales | 9.118.305.520 (según safetensors del repo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens en el modelo base; la model card recomienda `max_model_len` de 65.536 en vLLM (16.384 en tarjetas de 24 GB) |
| Tipos de cuantizacion | GLQ a 4,0 bits/peso (trellis-coded QTIP TCQ variante `3inst` + RHT + LDLQ, tasa nativa de trellis, sin apilado de residuales) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 18,2 GB), compatible con transformers y vLLM mediante el plugin `glq` |

## Arquitectura y entrenamiento

El modelo base, NousResearch/Arete-27B, es según la model card un Qwen3.8-27B tras un ajuste fino supervisado sobre NousResearch/arete-data-pairs, con la arquitectura sin modificar. Eso implica que hereda el comportamiento de servicio de Qwen3.8-27B: activaciones en bf16, el parser de tool calling `qwen3_xml`, el parser de razonamiento `qwen3` y unos parámetros de muestreo por defecto de temperatura 1.0, top_p 0.95 y top_k 20, recogidos en el `generation_config.json` del repo y aplicados por vLLM.

Sobre esa base, esta publicación aplica GLQ: cuantización con código de trellis (QTIP TCQ, variante `3inst`), transformada de Hadamard aleatorizada y LDLQ, a una tasa uniforme de 4,0 bits/peso. La calibración se realizó con 128 muestras de 2.048 tokens de WikiText-2, y el SQNR medio de pesos reportado es de 22,00 dB sobre 400 capas cuantizadas. Los pesos se mantienen comprimidos en memoria y se decodifican en el momento mediante kernels CUDA fusionados; esta versión requiere `glq >= 0.7.0` porque el checkpoint almacena el trellis en el layout de fragmentos MMA que consumen los kernels 3INST sin tabla de búsqueda. No se detalla en la información disponible el volumen de tokens de entrenamiento del SFT, la composición del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de texto y conversación multiturno, con la plantilla de chat del tokenizador.
- Razonamiento con parser dedicado (`qwen3`), aplicable en vLLM y en los wrappers `glq-chat` y `glq-code`.
- Tool calling / function calling mediante el parser `qwen3_xml`, con la advertencia de que un parser incorrecto falla de forma silenciosa.
- Uso como modelo base multimodal de entrada image-text-to-text (tags del repo); GLQ solo cuantiza el decodificador de texto, y la model card configura el servido en modo solo texto (`limit_mm_per_prompt` a cero).
- Integración con agentes de código (pi-code, opencode) a través de `glq-code`, que fija el muestreo en el servidor y dimensiona la ventana de contexto según la GPU.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistencia conversacional multiturno: el modelo puede mantener diálogos con contexto amplio gracias a la ventana de hasta 262.144 tokens del base, ajustando `max_model_len` al presupuesto de VRAM disponible (65.536 en vLLM por defecto, 16.384 en tarjetas de 24 GB).
- Agentes de código en local: mediante `glq-code --model xv0y5ncu/Arete-27B-GLQ-trellis-3inst-4bpw` se levanta un servidor vLLM con el parser de tool calling correcto y se ejecuta el agente pi contra él, evitando el fallo silencioso de un parser mal configurado.
- Automatización de tareas con function calling: integrable en pipelines que necesiten que el modelo emita llamadas estructuradas en el marcado `qwen3_xml`, con el muestreo fijado en servidor (top_k incluido, que no es un campo de la API de OpenAI).
- Despliegue en una sola GPU de 24 o 32 GB: la cuantización a 4,0 bits/peso y el planificador de `glq-code` (ventana de 16.384 tokens en 24 GB, 65.536 en 32 GB) permiten servir el modelo en hardware de gama alta de consumo o profesional sin apilar residuales.
- Prototipado e investigación sobre alineamiento de valores: al derivar de un SFT sobre arete-data-pairs, sirve para estudiar el efecto del ajuste en valores manteniendo la arquitectura Qwen3.8-27B y comparar contra el base sin cuantizar.
- Evaluación de la propia cuantización GLQ: con un SQNR de 22,00 dB documentado y calibración reproducible (128 muestras × 2.048 tokens de WikiText-2), es un punto de partida para medir la degradación frente a bf16 en tareas de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de calidad reportado es el SQNR medio de pesos de 22,00 dB sobre 400 capas cuantizadas, que mide el error de cuantización, no el rendimiento en tareas.

## Requisitos de hardware

- VRAM para pesos: el repo ocupa 18,2 GB en safetensors a 4,0 bits/peso; los pesos se mantienen comprimidos en memoria y se decodifican al vuelo.
- Caché KV: una secuencia de 262.144 tokens requiere unos 16,3 GiB adicionales sobre los pesos (medición del chequeo de arranque de vLLM). En una tarjeta de 32 GB hay que reducir `max_model_len`.
- Configuración recomendada en la model card: `max_model_len=65536` en vLLM, `max_num_seqs=1`, `max_num_batched_tokens=2048` (paso de prefill de `vllm serve` por debajo de 70 GiB de VRAM) y `dtype="bfloat16"`.
- GPU de 24 GB: la model card indica `max_model_len=16384`; `glq-code` necesita `glq >= 0.8.38` para planificar esa ventana en 24 GB (versiones anteriores lo rechazan).
- GPU de 32 GB: `glq-code` planifica 65.536 tokens de contexto.
- GPUs concretas recomendadas (A100, H100, RTX 4090, etc.): no disponible en la información proporcionada.
- Despliegue: vLLM (recomendado, con el plugin `glq` registrado automáticamente) o Transformers con `pip install 'glq[hf]'` e `import glq.hf_integration`. `glq-code` y `glq-chat` requieren `glq >= 0.8.36`; en 24 GB, `glq-code` requiere `0.8.38`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Arete-27B-GLQ-trellis-3inst-4bpw | 9.118.305.520 (safetensors) | 262.144 en el base; 65.536 recomendado en vLLM | GLQ 4,0 bpw | Apache 2.0 | Requiere runtime `glq` y kernels CUDA |
| NousResearch/Arete-27B | no disponible | 262.144 (heredado del base) | bf16 | no disponible | Modelo base sin cuantizar; referencia de calidad |
| Qwen3.8-27B | no disponible | 262.144 (según la model card) | bf16 y otras | no disponible | Arquitectura original; mismo servicio y parsers |

No se dispone de datos de benchmarks que permitan comparar rendimiento en tareas entre estas variantes.

## Limitaciones y advertencias

- Dependencia estricta del runtime: requiere `glq >= 0.7.0`; con versiones anteriores el checkpoint no carga porque el trellis está en layout de fragmentos MMA. `glq-code` y `glq-chat` necesitan `0.8.36`, y en 24 GB `glq-code` exige `0.8.38`.
- El parser de tool calling debe coincidir con el marcado del modelo (`qwen3_xml`); un parser ausente o incorrecto falla en silencio y produce llamadas que nunca se parsean, lo que parece un fallo del modelo y no de la configuración.
- El contexto largo consume memoria de forma significativa: 262.144 tokens implican unos 16,3 GiB de caché KV sobre los pesos, por lo que en tarjetas de 32 GB hay que bajar `max_model_len`.
- Solo se cuantiza el decodificador de texto; las torres de visión y audio quedan en formato nativo y la model card configura el servido en modo solo texto.
- El error de cuantización es medible (SQNR de 22,00 dB), pero no se han publicado evaluaciones de tareas que cuantifiquen la degradación frente al base en bf16.
- Sesgos conocidos, riesgo de alucinación e idiomas soportados: no disponibles en la información proporcionada.
- Licencia Apache 2.0, que permite uso comercial; conviene verificar igualmente las condiciones del modelo base NousResearch/Arete-27B, cuya licencia no se detalla en la información disponible.
- Al ejecutar como script con vLLM es obligatorio el guard `if __name__ == "__main__":`, porque vLLM cambia al método de multiprocesamiento `spawn` tras inicializar CUDA y los procesos trabajadores reimportan el fichero.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xv0y5ncu/Arete-27B-GLQ-trellis-3inst-4bpw
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Dataset de ajuste: https://huggingface.co/datasets/NousResearch/arete-data-pairs
- Repositorio de GLQ: https://github.com/cnygaard/glq
- Script de instalación de GLQ: https://raw.githubusercontent.com/cnygaard/glq/main/install.sh
- Paper referenciado en los tags (arXiv:2406.11235): https://arxiv.org/abs/2406.11235
