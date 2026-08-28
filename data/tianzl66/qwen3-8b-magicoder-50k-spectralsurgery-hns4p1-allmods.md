# tianzl66/Qwen3-8B-Magicoder-50K-SpectralSurgery-HNS4p1-AllMods

## Resumen

Este repositorio contiene un adaptador LoRA (peft) sobre el modelo base Qwen/Qwen3-8B, entrenado con el dataset Magicoder (50K muestras) durante una época, y posteriormente refinado mediante una técnica post-hoc denominada Spectral Surgery con configuración HNS 4+1. El resultado es un adaptador especializado en generación de código que mejora significativamente el rendimiento en benchmarks de programación sin necesidad de entrenamiento adicional.

La relevancia de este modelo radica en que demuestra cómo una intervención post-hoc sobre los pesos de un adaptador LoRA puede superar al checkpoint original de entrenamiento, logrando mejoras de hasta 7,32 puntos porcentuales en HumanEval y 2,33 en MBPP respecto al LoRA sin procesar. El adaptador es ligero (0,2 GB) y se distribuye en formato safetensors, lo que facilita su integración en pipelines existentes.

El autor, tianzl66, publica este trabajo como una contribución a la investigación sobre técnicas de optimización de adaptadores para modelos de lenguaje, con un enfoque práctico en tareas de código. No se especifican la licencia ni los idiomas soportados, por lo que se recomienda contactar con el autor antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3-8B) + adaptador LoRA |
| Parametros totales | 8B (modelo base) + adaptador LoRA (no especificado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (secuencia de entrenamiento del adaptador: 4096) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador peft) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 aplicado a todos los módulos lineales del transformer Qwen3-8B. El entrenamiento del adaptador se realizó sobre el dataset Magicoder (50K muestras de instrucciones de código) durante una época, con una longitud de secuencia de 4096 tokens, batch global de 32, learning rate de 2e-5 y seed 42.

Posteriormente se aplicó Spectral Surgery con configuración HNS 4+1 (4 pasos rápidos y 1 paso estable) sobre todos los módulos LoRA, manteniendo el rango de salida en 16. Esta técnica post-hoc modifica los pesos del adaptador sin entrenamiento adicional, mejorando la calidad de las respuestas de código. No se han publicado detalles sobre la implementación exacta de HNS ni sobre el dataset de evaluación más allá de los benchmarks reportados.

## Capacidades

- Generación de código en lenguajes de programación generales, con especialización en problemas de tipo HumanEval y MBPP.
- Mejora notable en tareas de razonamiento algorítmico y completado de funciones.
- Compatible con el formato de chat del modelo base Qwen3-8B (prompt de chat para HumanEval).
- Al ser un adaptador, puede combinarse con el modelo base para tareas generales de texto, aunque su entrenamiento está enfocado en código.
- No se reportan capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- Asistente de programación integrado en IDE: el adaptador puede usarse como backend para autocompletado de código o sugerencias de implementación, aprovechando la mejora en HumanEval para generar funciones correctas.
- Generación de tests unitarios: dado su rendimiento en MBPP (75,10% Pass@1), puede proponer casos de prueba para funciones dadas.
- Refactorización de código: al entender patrones de código, puede sugerir reescrituras más limpias o eficientes.
- Educación en programación: como tutor que explica soluciones a ejercicios clásicos de algoritmia.
- Pipeline de CI/CD para revisión de código: integrado con herramientas de análisis estático, puede proponer correcciones a fragmentos defectuosos.
- Investigación en optimización de adaptadores: sirve como ejemplo de aplicación de Spectral Surgery sobre LoRA para experimentos académicos.

## Benchmarks y rendimiento

La siguiente tabla recoge los resultados reportados en la model card, obtenidos con decodificación greedy, prompt de chat para HumanEval, `max_new_tokens=512` y tamaño de lote 8.

| Metodo | HumanEval-chat Pass@1 | MBPP-sanitized Pass@1 |
|---|---:|---:|
| Qwen3-8B Base | 64,63% (106/164) | 72,76% (187/257) |
| LoRA, Epoch 1 | 67,07% (110/164) | 72,76% (187/257) |
| **LoRA + HNS 4+1, all modules** | **74,39% (122/164)** | **75,10% (193/257)** |

La mejora del adaptador con HNS sobre el LoRA original es de +7,32 puntos en HumanEval y +2,33 en MBPP. Frente al modelo base, la mejora es de +9,76 y +2,33 puntos respectivamente.

## Requisitos de hardware

- El adaptador ocupa solo 0,2 GB, por lo que puede cargarse junto al modelo base Qwen3-8B en una GPU con al menos 16 GB de VRAM en fp16 (por ejemplo, RTX 4090, A100 40GB).
- Con cuantización del modelo base (por ejemplo, 4-bit con bitsandbytes), puede ejecutarse en GPUs consumer de 8 GB como RTX 3070 o RTX 4060.
- Para despliegue en producción, se recomienda usar vLLM o TGI con soporte de adaptadores LoRA (por ejemplo, `--lora-modules`).
- En entornos locales, llama.cpp u Ollama pueden cargar el adaptador si se fusiona previamente con el modelo base.
- La latencia es la propia del modelo Qwen3-8B; el adaptador añade un coste mínimo al ser de rango 16.

## Comparativa con modelos similares

Dado que se trata de un adaptador sobre Qwen3-8B, la comparación más directa es con el modelo base y con el LoRA sin procesar, ya incluidos en la tabla de benchmarks. No se dispone de datos para comparar con otros adaptadores de código como CodeLlama-7B o DeepSeek-Coder-6.7B en las mismas condiciones.

| Modelo | Parametros | Contexto | HumanEval Pass@1 | MBPP Pass@1 | Licencia |
|---|---|---|---:|---:|---|
| Qwen3-8B Base | 8B | 32K (no confirmado) | 64,63% | 72,76% | Apache 2.0 (modelo base) |
| LoRA Epoch 1 | 8B + LoRA | 4096 (entrenamiento) | 67,07% | 72,76% | no disponible |
| **LoRA + HNS 4+1** | 8B + LoRA | 4096 (entrenamiento) | **74,39%** | **75,10%** | no disponible |

## Limitaciones y advertencias

- No se especifica la licencia del adaptador; el uso comercial requiere confirmación del autor.
- Los benchmarks se limitan a HumanEval y MBPP; no hay evidencia de rendimiento en otros dominios como razonamiento general o conversación.
- La longitud de contexto efectiva no está documentada; el entrenamiento usó 4096 tokens, por lo que puede degradarse en secuencias más largas.
- No se han evaluado sesgos ni alucinaciones; al ser un modelo de código, puede generar soluciones incorrectas o inseguras.
- La técnica Spectral Surgery es experimental; no hay garantías de robustez en escenarios fuera de los evaluados.
- El repositorio tiene 0 descargas y 0 likes, lo que indica poca validación externa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tianzl66/Qwen3-8B-Magicoder-50K-SpectralSurgery-HNS4p1-AllMods
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B (no enlazado directamente en la información, pero es el base)
- Proyecto Magicoder (dataset y metodología): https://github.com/ise-uiuc/magicoder
- Página oficial de Qwen: https://qwen.ai/home
