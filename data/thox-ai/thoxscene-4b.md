# Thox-ai/ThoxScene-4B

## Resumen

ThoxScene-4B es un ajuste fino (fine-tune) del modelo ccore/Qwen3.5-4B-3D-Coder, que a su vez deriva de Qwen/Qwen3.5-4B, desarrollado por Thox-ai. Su proposito es convertir una descripcion en lenguaje natural de una escena en un unico archivo HTML autocontenido que renderiza una escena interactiva de Three.js, incluyendo geometria, materiales, iluminacion, animacion y controles de camara en linea. El modelo esta pensado para ejecutarse en dispositivos de la familia THOX (ThoxMini y ThoxClip) dentro de ThoxOS.

El modelo cuenta con 4.205.751.296 parametros (aproximadamente 4B) y sigue la arquitectura Qwen3.5. Se distribuye en safetensors FP16 y en dos builds GGUF (Q4_K_M y Q8_0) bajo licencia Apache-2.0, lo que facilita su despliegue en entornos de inferencia locales. Su relevancia radica en la especializacion: sustituye el preambulo de razonamiento del modelo base por una salida directa y ha sido entrenado sobre un corpus validado por renderizado en Chromium headless.

La model card lo describe explicitamente como una "linea base documentada" y no como un lanzamiento que haya superado los criterios de promocion predefinidos por el programa. En la evaluacion de renderizado retenida alcanza 17 de 24 escenas validas en un solo intento (70,8 %), frente al 20,8 % del modelo base, aunque conserva un modo de fallo residual conocido relacionado con la disciplina de variables en generaciones largas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (qwen3_5), transformer |
| Parametros totales | 4.205.751.296 (~4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens empaquetados por defecto; se recomienda elevar `num_ctx` para las escenas mas largas; salida de hasta 16K tokens |
| Tipos de cuantizacion | GGUF Q4_K_M (2.708.804.384 B) y GGUF Q8_0 (4.482.403.104 B); safetensors FP16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP16) y GGUF (Q4_K_M, Q8_0) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3.5 y se obtiene mediante un ajuste fino con LoRA de rango 64 y alpha 128 (fp-LoRA r64 / α128) aplicado sobre todas las capas lineales, con la torre de vision congelada y posteriormente fusionada. El resultado es el snapshot `v2-lora-r64`, que es la version distribuida. El modelo base inmediato es ccore/Qwen3.5-4B-3D-Coder, un fine-tune de Qwen/Qwen3.5-4B; Thox-ai no entrena los modelos base, solo realiza la especializacion.

El corpus de entrenamiento (Thox-ai/thoxscene-corpus, privado) se construyo con validacion por renderizado: cada objetivo de entrenamiento paso una comprobacion en Chromium headless (cero errores de consola o de pagina, presencia de canvas y fotograma no vacio) antes de incorporarse al corpus. La especializacion tambien modifica el contrato de salida: el modelo responde directamente con un unico bloque ` ```html ` que contiene el archivo completo, sin preambulo de razonamiento, y fija el nucleo de Three.js en la version r160 con los controles de camara implementados en linea y sin addons. La model card indica que se intento tambien un ajuste fino completo que obtuvo peores resultados.

## Capacidades

- Generacion de codigo especializado en Three.js: produce un archivo HTML autocontenido con geometria, materiales, iluminacion, animacion y controles de camara.
- Salida directa sin preambulo de razonamiento: el contrato de servicio exige thinking desactivado; la respuesta es exactamente un bloque ` ```html `.
- Generacion de escenas interactivas en un solo intento (one-shot), con controles de camara implementados en linea.
- Especializacion en escenas de producto y dispositivos, visualizaciones de datos tipo MeshStack, dioramas educativos, interiores, mecanismos y escenas voxel.
- Capacidades multilingues limitadas al ingles.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision: la torre de vision del modelo base se congela durante el entrenamiento; no se documentan capacidades de vision en el uso previsto.

## Casos de uso

- Escaparates de producto y dispositivos: el modelo genera una escena Three.js interactiva que muestra un producto con materiales, iluminacion y controles de camara, adecuada para incrustar en aplicaciones de ThoxOS con un WebView aislado.
- Visualizaciones de datos tipo MeshStack: a partir de una descripcion textual de los datos se obtiene una escena 3D navegable en un unico archivo, sin dependencias de addons, lo que simplifica su despliegue.
- Dioramas educativos: descripciones de fenomenos o entornos se traducen en escenas interactivas para materiales didacticos, aprovechando la validacion por renderizado del corpus de entrenamiento.
- Prototipado rapido de interiores y mecanismos: el modelo produce maquetas 3D navegables en un solo paso, utiles para iterar sobre disposiciones espaciales antes de un modelado formal.
- Escenas voxel: generacion de composiciones volumetricas descritas en lenguaje natural, con animacion y camara incluidas en el mismo archivo.
- Generacion de escenas en dispositivo: despliegue local con el build Q4_K_M en hosts de clase dispositivo (ThoxMini, ThoxClip) o con Q8_0 en hosts de clase superior, mediante llama.cpp, LM Studio u Ollama.
- Integracion en aplicaciones ThoxOS: el modelo se invoca desde chat y devuelve el archivo HTML listo para renderizar en un contexto aislado, con el nucleo de Three.js r160 fijado por el system prompt de la casa.

## Benchmarks y rendimiento

| Metrica | ThoxScene-4B (v2-lora-r64) | Modelo base upstream |
|---|---|---|
| Escenas con render valido en un solo intento (24 escenas retenidas) | 17/24 (70,8 %) | 5/24 (20,8 %) |
| Validez sintactica de JavaScript | 91,7 % | no disponible |
| Truncamiento en el limite de tokens | 4,2 % | 83,3 % |

La model card senala que estos resultados no alcanzan los criterios de promocion predefinidos del programa y que un segundo intento mediante ajuste fino completo obtuvo peores resultados. No se publican resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el build Q4_K_M ocupa 2.708.804.384 B (~2,7 GB) y el Q8_0 4.482.403.104 B (~4,5 GB); el safetensors FP16 requiere aproximadamente 8,4 GB solo para los pesos.
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible; por tamano, el build Q4_K_M cabe en GPU de consumo con 4 GB o mas de VRAM y el Q8_0 en GPU con 6-8 GB o mas.
- Cabe en GPU de consumo: si, con el build Q4_K_M en tarjetas de 4 GB o mas y con Q8_0 en tarjetas de 6-8 GB o mas.
- Opciones de despliegue: llama.cpp (se requiere una build reciente con soporte de Qwen3.5), LM Studio (desactivar MTP para esta familia) y Ollama (`ollama run Thox-ai/thoxscene-4b` para Q4_K_M, `ollama run Thox-ai/thoxscene-4b:q8_0` para Q8_0).
- Parametros de muestreo recomendados: temperatura 0.7, top-p 0.95, top-k 20, repetition penalty 1.0, con thinking desactivado (`"think": false` en la API de Ollama) y hasta 16K tokens de salida para escenas complejas.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThoxScene-4B | ~4B | 8.192 por defecto (ampliable) | Escenas Three.js en un unico HTML | Apache-2.0 | Hugging Face, Ollama |
| ccore/Qwen3.5-4B-3D-Coder | ~4B | no disponible | Codigo 3D (modelo base inmediato) | no disponible | Hugging Face |
| Qwen/Qwen3.5-4B | ~4B | no disponible | Proposito general | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos con otras alternativas fuera de la comparacion con el modelo base upstream recogida en la seccion anterior.

## Limitaciones y advertencias

- La model card lo califica como linea base documentada, no como lanzamiento que haya superado los criterios de promocion del programa.
- Modo de fallo residual conocido: disciplina de variables en generaciones largas, que puede producir escenas no validas.
- El HTML y JavaScript generados son codigo no confiable: deben ejecutarse solo en un WebView aislado o un frame aislado sin acceso a APIs privilegiadas, archivos locales ni credenciales, nunca en un contexto de pagina de confianza.
- El contrato de servicio exige thinking desactivado; con el razonamiento activado, el preambulo del modelo base desplaza la salida directa de escena para la que fue entrenado.
- El contexto empaquetado por defecto es de 8.192 tokens y debe ampliarse para las escenas mas largas; el limite de salida es de hasta 16K tokens.
- Solo soporta ingles.
- Uso previsto limitado: no esta pensado para mundos a escala de videojuego, precision de nivel CAD ni generacion de codigo para contextos de ejecucion privilegiados.
- No se documentan sesgos especificos ni tasas de alucinacion en la informacion disponible.
- La licencia Apache-2.0 permite uso comercial, pero debe respetarse el aviso de sandboxing para el codigo generado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thox-ai/ThoxScene-4B
- Modelo base inmediato: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-4B
- Corpus de entrenamiento (privado): Thox-ai/thoxscene-corpus
- Organizacion Thox-ai en Hugging Face: https://huggingface.co/Thox-ai
- Demo de dispositivos virtuales: https://thox.ai/#demo-callout-home_lineup
- Campana de Kickstarter: https://www.kickstarter.com/projects/thox/four-devices-one-private-ai-ecosystem-thoxai?ref=hf-thoxscene-4b
