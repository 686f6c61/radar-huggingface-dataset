# tinyopsec/Vikhr-Qwen-2.5-0.5b-Instruct-GGUF

## Resumen

Vikhr-Qwen-2.5-0.5b-Instruct es una cuantización en formato GGUF del modelo `Vikhrmodels/Vikhr-Qwen-2.5-0.5b-Instruct`, un ajuste fino del Qwen2.5-0.5B-Instruct de Alibaba orientado al idioma ruso. El repositorio, publicado por el usuario tinyopsec, no aporta pesos nuevos: su valor está en ofrecer trece variantes de cuantización (desde F16 hasta Q2_K) generadas con llama.cpp, listas para ejecutarse localmente en CPU o en GPUs modestas.

El modelo resuelve un problema concreto: disponer de un asistente instruct muy pequeño (494 millones de parámetros) con buen manejo del ruso, capaz de correr en hardware mínimo sin depender de servicios en la nube. Es relevante para casos de uso embebidos, prototipado rápido y despliegues donde la latencia y la huella de memoria pesan más que la calidad máxima de generación.

Al tratarse de un modelo de medio bilón de parámetros, sus capacidades de razonamiento y conocimiento son limitadas en comparación con modelos de 7B o más; la model card del propio autor recomienda evaluarlo antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen2.5) |
| Parámetros totales | 493.789.952 (~0,5B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en el repositorio (el Qwen2.5-0.5B-Instruct original soporta 32.768 tokens, dato no confirmado para este fine-tune) |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | Ruso (foco del fine-tune); otros idiomas no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base original está en safetensors) |

## Arquitectura y entrenamiento

La arquitectura base es un transformer decoder de la familia Qwen2.5, con 494 millones de parámetros. El modelo original (`Qwen/Qwen2.5-0.5B-Instruct`) fue entrenado por Alibaba con preentrenamiento masivo multilingüe seguido de un pipeline instruct (SFT con datos de instrucciones). Sobre esa base, el equipo Vikhrmodels realizó un fine-tune adicional centrado en mejorar el rendimiento en ruso.

Los detalles del fine-tune (número de tokens, composición del dataset, uso de DPO o RLHF) no están disponibles en la información proporcionada. La innovación de este repositorio en concreto es de distribución: cuantizaciones GGUF generadas con llama.cpp que cubren un rango completo de compromisos calidad/tamaño, con Q4_K_M señalada como recomendada por el autor.

## Capacidades

- Generación de texto conversacional en formato instruct (chat multi-turno con plantilla de Qwen2.5).
- Buen rendimiento relativo en ruso, el foco declarado del fine-tune.
- Compatibilidad con cualquier runtime GGUF: llama.cpp, Ollama, LM Studio, koboldcpp.
- Ejecución viable en CPU gracias a su tamaño reducido.
- No hay evidencia de soporte de tool calling, function calling, visión ni audio en este fine-tune.
- No es un modelo de razonamiento extendido (no tiene thinking mode).

## Casos de uso

- Chatbots ligeros en ruso: su formato instruct y su tamaño permiten gestionar conversaciones sencillas en dispositivos de bajos recursos o en servidores pequeños sin coste de GPU.
- Prototipado local de asistentes: con Ollama o LM Studio se puede levantar un endpoint conversacional en minutos para validar ideas antes de escalar a modelos mayores.
- Integración en aplicaciones de escritorio: las cuantizaciones Q4 o Q5 ocupan entre ~350 MB y ~1 GB, aptas para distribuirse junto a la aplicación.
- Sistemas embebidos y edge: la variante Q2_K o Q3_K_S puede ejecutarse en hardware muy limitado (Raspberry Pi 5, mini PCs) para tareas de texto simples.
- Clasificación y extracción de texto en ruso: tareas estructuradas de NLP (etiquetado, resumen corto, reescritura) donde no se requiere razonamiento profundo.
- Generación de datos sintéticos de bajo coste: en batch masivo en CPU, su velocidad y tamaño lo hacen útil para generar o filtrar grandes volúmenes de texto sencillo.
- Fallback offline: como respaldo local cuando no hay conectividad o presupuesto de API en productos que ya usan modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM / memoria estimada para inferencia:
  - F16: ~1,0 GB
  - Q8_0: ~0,55 GB
  - Q4_K_M: ~0,35 GB (estimación típica para 0,5B; el tamaño exacto por fichero no se detalla en la model card)
  - Q2_K: ~0,25 GB
- GPU recomendadas: no es necesario usar GPU; cualquier GPU moderna con 2 GB de VRAM sobra. En CPU funciona sin problemas (el tamaño del repo completo es de 5,8 GB con las 13 cuantizaciones).
- Consumer GPUs: cabe con holgura en cualquier GPU, incluidas integradas (con offload parcial o total en RTX 3060, RTX 4060 o superiores ejecuta a velocidades muy altas).
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. No está orientado a vLLM o TGI, que requieren formatos safetensors.
- Latencia y throughput: no disponibles; por su tamaño (0,5B) se esperan decenas de tokens por segundo incluso en CPU moderna.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Foco |
|---|---|---|---|---|---|
| Vikhr-Qwen-2.5-0.5b-Instruct (este) | 0,5B | no disponible (base: 32.768) | Apache 2.0 | GGUF | Ruso, instruct |
| Qwen/Qwen2.5-0.5B-Instruct (base) | 0,5B | 32.768 | Apache 2.0 | safetensors, GGUF | Multilingüe, instruct |
| Qwen2.5-0.5B-Instruct (cuantizaciones comunitarias GGUF) | 0,5B | 32.768 | Apache 2.0 | GGUF | Multilingüe, sin fine-tune ruso |

Frente al modelo base, esta versión ofrece un fine-tune específico en ruso y un catálogo amplio de cuantizaciones listas para usar. Frente a alternativas de tamaño similar (por ejemplo, Gemma 2 2B o Llama 3.2 1B), es notablemente más pequeño y por tanto menos capaz, pero mucho más ligero de desplegar.

## Limitaciones y advertencias

- Capacidad de razonamiento muy limitada por su tamaño (0,5B): no apto para matemáticas complejas, código exigente ni razonamiento multi-paso fiable.
- Riesgo elevado de alucinación, habitual en modelos de este tamaño; la propia model card advierte "Evaluate before use".
- Foco en ruso: el rendimiento en castellano u otros idiomas no está documentado y probablemente sea inferior al del modelo base multilingüe.
- Longitud de contexto no confirmada para este fine-tune; verificar antes de depender de contextos largos.
- Sesgos: hereda los sesgos del corpus de preentrenamiento de Qwen2.5 y del dataset del fine-tune (no documentado).
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial.
- Descargas aún bajas (427) y sin comunidad de validación: conviene hacer pruebas propias antes de producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tinyopsec/Vikhr-Qwen-2.5-0.5b-Instruct-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Modelo original fine-tuneado: https://huggingface.co/Vikhrmodels/Vikhr-Qwen-2.5-0.5b-Instruct
