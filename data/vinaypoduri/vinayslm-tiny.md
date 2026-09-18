# vinaypoduri/vinayslm-tiny

## Resumen

VinaySLM (tiny) es un modelo de lenguaje de 466.176 parametros desarrollado por el usuario vinaypoduri y publicado en Hugging Face bajo licencia MIT. No es un modelo de proposito general: se trata de un Transformer decoder-only estilo GPT escrito desde cero en PyTorch con el objetivo explicito de demostrar, de forma didactica, el ciclo completo de un modelo de lenguaje (tokenizacion, embeddings, self-attention causal, entrenamiento y generacion) sin reutilizar ninguna arquitectura preentrenada. El propio autor advierte en la model card que "no es un modelo de calidad de produccion".

Tecnicamente es un Transformer decoder-only con pre-LayerNorm de 2 capas, dimension de embedding 128, 4 cabezas de atencion, dimension feed-forward de 512 y una longitud de contexto de solo 32 tokens. Su vocabulario es de 255 entradas y procede de un tokenizador de nivel de palabra construido a mano a partir del corpus de entrenamiento. El modelo fue entrenado sobre un corpus de juguete de aproximadamente 600 tokens con frases sobre inteligencia artificial y programacion, por lo que memoriza ese conjunto en lugar de generalizar.

Su relevancia no es funcional sino pedagogica: sirve como referencia minima verificable de como se empaqueta un Transformer casero en el ecosistema `transformers` mediante `trust_remote_code=True`, y como punto de partida reproducible para quien quiera estudiar el pipeline completo de entrenamiento y exportacion. No compite con ningun modelo de produccion ni resulta util para tareas reales de generacion de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (estilo GPT, pre-LayerNorm) |
| Parametros totales | 466.176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin versiones cuantizadas publicadas) |
| Idiomas soportados | no disponible (el corpus de entrenamiento esta en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Vocabulario | 255 tokens (tokenizador de nivel de palabra) |
| Dimension de embedding | 128 |
| Capas del Transformer | 2 |
| Cabezas de atencion | 4 |
| Dimension feed-forward | 512 |
| Dropout | 0.0 |
| Codificacion posicional | embeddings posicionales absolutos aprendidos |
| LM head | no atada (untied) al embedding de tokens |
| Decodificacion | greedy (argmax) unicamente, sin muestreo |
| Requiere codigo remoto | si (`trust_remote_code=True`) y paquete `vinayslm` instalado |

## Arquitectura y entrenamiento

La arquitectura es un Transformer decoder-only clasico con normalizacion previa a cada subcapa (pre-LayerNorm), dos bloques, cuatro cabezas de atencion y una dimension feed-forward de 512, con embeddings posicionales absolutos aprendidos y una cabeza de lenguaje no atada de la matriz de embeddings. No incorpora ninguna innovacion tecnica como atencion lineal, MoE, SSM ni decodificacion especulativa: es una implementacion minimalista y correcta de la atencion causal estandar. El tokenizador es de nivel de palabra, escrito desde cero: el texto se pasa a minusculas y se segmenta con una expresion regular en palabras y signos de puntuacion, y el vocabulario se construyo directamente a partir del corpus. Los unicos tokens especiales son `<pad>`, `<unk>`, `<bos>` y `<eos>`; no se emplea BPE ni ningun tokenizador preentrenado.

El entrenamiento se realizo sobre un corpus de juguete escrito a mano (fichero `data/raw/toy_corpus.txt`) compuesto por unas pocas docenas de frases sobre IA y programacion, con un total aproximado de 600 tokens. No se menciona en la informacion disponible ningun proceso de RLHF, DPO ni ajuste por instrucciones. El autor indica explicitamente que el modelo sobreajusta de forma severa a ese corpus: ante prompts cercanos a una frase de entrenamiento tiende a reproducirla literalmente, y ante prompts novedosos genera continuaciones repetitivas o de baja calidad. La exportacion a Hugging Face se realiza con `scripts/export_hf.py`, que verifica que la salida greedy coincide exactamente con la del modelo local original.

## Capacidades

- Generacion de texto autoregresiva con decodificacion greedy (argmax); no hay soporte de sampling, temperatura, top-k ni top-p.
- Reproduccion de frases del corpus de entrenamiento cuando el prompt se aproxima a una de ellas (comportamiento memoristico, no generativo).
- Continuacion de texto a nivel de palabra en ingles, limitada a un maximo de 32 tokens de contexto.
- Inspeccion y estudio del pipeline completo: tokenizacion, embeddings, atencion causal, entrenamiento y generacion.
- Integracion con el ecosistema `transformers` mediante clases propias (`VinaySLMForCausalLM`, `VinaySLMTokenizer`, `generate_greedy`) y `trust_remote_code=True`.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multilingues: el corpus y el vocabulario son de ingles.
- No dispone de vision, audio, modo thinking ni ninguna capacidad multimodal.

## Casos de uso

- Docencia de arquitecturas Transformer: el modelo permite recorrer en clase, con un numero de parametros abarcable (466.176), cada componente de un decoder-only (tokenizador, embeddings, atencion causal, LayerNorm, LM head) sobre codigo legible y sin dependencias de arquitecturas preentrenadas.
- Pruebas unitarias de pipelines de Hugging Face: al ser un modelo diminuto y determinista (greedy puro), resulta adecuado para verificar que un flujo de carga con `trust_remote_code=True`, descarga de safetensors y generacion funciona de extremo a extremo antes de pasar a modelos grandes.
- Pruebas de integracion en CI/CD: su peso minimo permite incluirlo en un test automatizado que valide la compatibilidad de una version de `transformers` con codigo remoto, sin coste de GPU ni tiempos de descarga apreciables.
- Referencia de implementacion para quien construye su propio modelo desde cero: sirve como plantilla para comparar la propia implementacion de atencion causal y comprobar que las formas de los tensores y la salida greedy coinciden.
- Experimentos de sobreajuste controlado: con 2 capas y 466.176 parametros sobre ~600 tokens de entrenamiento, es un banco de pruebas didactico para observar memorizacion frente a generalizacion y para medir el efecto del tamano del corpus.
- Demo de exportacion a formato Hugging Face: el repositorio documenta el script de exportacion y la verificacion de equivalencia entre el modelo local y el empaquetado, lo que lo convierte en un ejemplo reproducible de publicacion de artefactos propios.
- Analisis de tokenizadores de nivel de palabra: permite estudiar de forma aislada las consecuencias de un vocabulario de 255 entradas (fragmentacion, tokens desconocidos, sensibilidad a mayusculas y puntuacion) frente a tokenizadores subword.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta metricas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto estandar, y el propio modelo esta declarado como no apto para produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en precision completa (466.176 parametros, aproximadamente 1,9 MB en fp32 y menos de 1 MB en fp16); en la practica cabe en cualquier dispositivo.
- GPU recomendadas: ninguna en particular; el modelo funciona igual de bien en CPU.
- Compatibilidad con GPU de consumo: si, en cualquier GPU de consumo e incluso en CPU sin aceleracion, dado su tamano.
- Opciones de despliegue: no hay integraciones publicadas con vLLM, llama.cpp, Ollama ni TGI. El unico camino documentado es `transformers` con `trust_remote_code=True` o la importacion directa de las clases del paquete `vinayslm`.
- Latencia y throughput estimados: no disponible en la informacion proporcionada. Con 2 capas, contexto de 32 tokens y vocabulario de 255 entradas, la latencia esperada es del orden de milisegundos en CPU, aunque no se ha publicado ninguna medicion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VinaySLM (tiny) | 466.176 | 32 tokens | Educativo, Transformer escrito desde cero | MIT | Hugging Face, requiere `trust_remote_code` y paquete `vinayslm` |
| GPT-2 small | 124 millones | 1024 tokens | Modelo de lenguaje preentrenado de proposito general | Licencia MIT modificada | Hugging Face, `transformers` nativo |
| nanoGPT (reproduccion de Karpathy) | Configurable (por defecto ~124 millones) | Configurable | Reproduccion educativa de GPT-2 en PyTorch | MIT | Repositorio GitHub, no es un artefacto de Hugging Face |
| Modelos TinyStories (por ejemplo, variantes de ~1 millon de parametros) | ~1 millon | Configurable | Investigacion sobre generacion coherente en modelos muy pequenos | no disponible en la informacion proporcionada | Hugging Face |

La comparativa es necesariamente desigual: VinaySLM (tiny) es entre dos y tres ordenes de magnitud mas pequeno que GPT-2 small y su contexto es 32 veces menor, por lo que no resulta comparable en calidad de generacion. Su unico rasgo diferencial es la transparencia total del codigo y del proceso de entrenamiento.

## Limitaciones y advertencias

- Sobreajuste severo: el modelo fue entrenado para memorizar unas pocas docenas de frases; ante prompts novedosos produce continuaciones de baja calidad o repetitivas.
- No es apto para produccion. El propio autor lo declara explicitamente en la model card.
- Longitud de contexto de 32 tokens, insuficiente para cualquier tarea multi-turno o de documento largo.
- Decodificacion greedy exclusivamente (argmax): no hay muestreo, temperatura ni penalizaciones, lo que agrava la repeticion.
- Vocabulario de 255 entradas de nivel de palabra: alta tasa de tokens `<unk>` ante texto fuera del corpus y sensibilidad a mayusculas y puntuacion.
- Idiomas: el corpus de entrenamiento esta en ingles; no hay soporte multilingue declarado.
- Riesgo de alucinacion: aunque el modelo es demasiado pequeno para "alucinar" en el sentido habitual, si genera texto fuera del corpus produce secuencias sin sentido.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificacion y redistribucion con atribucion. No obstante, el uso comercial carece de sentido practico dado el rendimiento del modelo.
- Dependencia de codigo remoto: cargarlo exige `trust_remote_code=True`, lo que implica ejecutar codigo del autor, y ademas requiere instalar el paquete `vinayslm` porque las clases de Hugging Face son una envoltura fina sobre las clases del proyecto original.
- Sin resultados de benchmarks publicados, por lo que no es posible comparar su rendimiento de forma cuantitativa con otros modelos.
- No dispone de cuantizaciones GGUF ni de integraciones con runtimes de inferencia habituales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vinaypoduri/vinayslm-tiny
- No se han encontrado en la busqueda web enlaces relevantes al modelo (repositorio, paper, blog o demo). Los resultados devueltos por la busqueda no guardan relacion con VinaySLM ni con inteligencia artificial y han sido descartados.
- Referencias utiles del ecosistema, citadas en la model card: repositorio del proyecto VinaySLM (rutas internas `scripts/prepare_data.py`, `scripts/train.py`, `scripts/export_hf.py`, `checkpoints/tiny/` y `data/raw/toy_corpus.txt`); URL publica del repositorio no disponible en la informacion proporcionada.
