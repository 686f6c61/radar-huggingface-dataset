# zerolabllc/TeaAI-Nemo-12B-mini-GGUF

## Resumen

TeaAI-Nemo-12B-mini-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo TeaAI-Nemo-12B, publicada por zerolabllc. El modelo base cuenta con 12.247.782.400 parametros (aproximadamente 12,25 mil millones) y esta orientado a generacion de texto conversacional, con un enfasis explicito en roleplay y escritura creativa. Esta version "mini" no aporta entrenamiento nuevo: es el mismo modelo que el base, unicamente comprimido para poder ejecutarse en GPUs de 8 GB de VRAM.

La relevancia de esta publicacion radica en su enfoque de despliegue local: el autor ofrece tres niveles de cuantizacion (IQ4_XS, Q4_K_M y Q3_K_M) pensados para hardware de consumo, con instrucciones concretas para LM Studio, llama.cpp y Ollama. La longitud de contexto declarada es de 8192 tokens, coherente con el limite de entrenamiento indicado en la model card (menor o igual a 8192), y el formato de prompt es ChatML con plantilla incrustada en el propio archivo GGUF.

Se distribuye bajo licencia Apache-2.0, igual que el modelo base, y esta etiquetado exclusivamente para el idioma ingles. La model card advierte de que el modelo genera contenido sexual explicito y violencia grafica sin rechazar peticiones, por lo que se restringe a usuarios adultos (18+). El repositorio ocupa 20,4 GB y, en el momento de la informacion disponible, acumulaba 2 "me gusta" y 0 descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 12.247.782.400 (aprox. 12,25 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8192 tokens (entrenado con contexto menor o igual a 8192) |
| Tipos de cuantizacion | IQ4_XS (~6,7 GB), Q4_K_M (~7,5 GB), Q3_K_M (~6,1 GB); cuantizado desde un intermedio Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base (si es un transformer denso, MoE o hibrido), ni el numero de tokens de entrenamiento, la composicion del dataset o si se aplicaron tecnicas de alineacion como RLHF o DPO. La model card de esta publicacion remite explicitamente a la tarjeta del modelo principal (zerolabllc/TeaAI-Nemo-12B) para los detalles de entrenamiento, evaluacion y limitaciones, datos que no se incluyen en la informacion proporcionada.

Lo que si se especifica es el proceso de cuantizacion: los archivos GGUF se generaron a partir de un intermedio Q8_0 y no implican reentrenamiento alguno. El unico ajuste tecnico relevante es la plantilla de chat ChatML, que va incrustada en el propio GGUF. El autor recomienda una configuracion de muestreo concreta (temperatura 0,8-1,0; min_p 0,05; repetition_penalty 1,05; y uso de DRY/XTC si el runtime lo soporta).

## Capacidades

- Generacion de texto conversacional multi-turno con formato ChatML.
- Roleplay y juegos de rol escritos, con soporte de personajes definidos mediante bloque de sistema.
- Escritura creativa y narrativa de ficcion.
- Generacion de contenido adulto explicito (sexual y violencia grafica) sin rechazos, segun declara el autor.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles (idioma declarado: en).
- Modo "thinking", vision o audio: no disponibles.
- Capacidad especial: plantilla de chat embebida en el GGUF y configuracion de muestreo recomendada por el autor.

## Casos de uso

- Roleplay conversacional local: el modelo esta disenado para mantener conversaciones de rol sin censura, y la cuantizacion IQ4_XS cabe integramente en una GPU de 8 GB con contexto de unos 8k tokens, lo que permite ejecutarlo en un PC de consumo sin depender de la nube.
- Escritura creativa de ficcion: gracias a su orientacion a creative-writing, puede usarse como asistente para redactar relatos, dialogos y tramas, manteniendo coherencia dentro de la ventana de 8192 tokens.
- Generacion de dialogos para guiones o narrativa interactiva: util para producir ramas de dialogo de personajes en videojuegos o novelas visuales, con la plantilla ChatML delimitando system, user y assistant.
- Prototipado de personajes conversacionales: permite crear bots con personalidad definida en el bloque de sistema ({{char}}) para pruebas de concepto en aplicaciones de entretenimiento.
- Modelo base para fine-tuning en dominio especifico: al estar bajo Apache-2.0 y en formato GGUF, puede servir como punto de partida para ajustes orientados a generacion literaria o de contenido de ficcion, aunque para reentrenamiento haria falta el modelo completo, no el GGUF.
- Despliegue en entornos sin conectividad: mediante llama.cpp, LM Studio u Ollama se puede servir de forma totalmente offline, lo que encaja en escenarios de privacidad donde no se quiere enviar el texto a un servicio externo.
- Banco de pruebas de cuantizacion: los tres niveles ofrecidos permiten comparar el equilibrio entre calidad y VRAM en hardware limitado, util para decidir que cuantizacion desplegar en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamanos de archivo indicados por el autor):
  - IQ4_XS: ~6,7 GB, recomendado para 8 GB de VRAM, cabe entero en GPU con contexto de ~8k.
  - Q4_K_M: ~7,5 GB, requiere 8 GB con contexto corto o descargar algunas capas a CPU.
  - Q3_K_M: ~6,1 GB, pensado para GPUs de 6 GB o para contexto mas largo en 8 GB; calidad notablemente inferior.
- GPU recomendadas: tarjetas consumer de 8 GB (por ejemplo, gama RTX 3070 / 4060 Ti) para IQ4_XS; GPUs de 12 GB o superiores (RTX 3060 12 GB, 4070, etc.) permiten margen para contexto mas amplio. No se proporcionan recomendaciones para A100 o H100 en la informacion disponible.
- Cabe en GPU de consumo: si, con IQ4_XS en 8 GB; Q4_K_M y Q3_K_M tambien segun el margen y el uso de offload a CPU.
- Opciones de despliegue documentadas:
  - LM Studio: buscar `zerolabllc/TeaAI-Nemo-12B-mini-GGUF`, descargar un archivo y cargarlo (contexto 8192).
  - llama.cpp: `llama-server -hf zerolabllc/TeaAI-Nemo-12B-mini-GGUF:IQ4_XS -c 8192 -ngl 99`.
  - Ollama: `ollama run hf.co/zerolabllc/TeaAI-Nemo-12B-mini-GGUF:IQ4_XS`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada. El modelo pertenece a la categoria de LLM de aproximadamente 12 B de parametros cuantizados en GGUF para roleplay y escritura creativa, pero no se han facilitado especificaciones, resultados de rendimiento ni terminos de licencia de alternativas, por lo que no es posible establecer una comparacion rigurosa.

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| TeaAI-Nemo-12B-mini-GGUF | 12,25 B | 8192 | Apache-2.0 | GGUF | no disponible |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Contenido para adultos: el autor advierte explicitamente de que el modelo escribe contenido sexual explicito y violencia grafica sin negarse, y lo restringe a usuarios de 18 anos o mas.
- Sesgos conocidos: no disponibles en la informacion proporcionada; la model card no detalla analisis de sesgos.
- Riesgo de alucinacion: no documentado en la informacion disponible; es un riesgo inherente a los modelos generativos de este tipo.
- Limitacion de idioma: solo ingles declarado, sin soporte multilingue confirmado.
- Limitacion de contexto: la ventana de 8192 tokens puede quedarse corta para documentos largos o conversaciones muy extensas; superarla degrada la coherencia.
- Calidad de cuantizacion: el propio autor senala que Q3_K_M tiene calidad notablemente inferior, por lo que no es adecuada si se busca maxima fidelidad.
- Uso comercial: la licencia es Apache-2.0, pero la model card remite a las notas de licencia de datos del modelo base antes de cualquier uso comercial; conviene revisarlas.
- Trazabilidad de calidad: no hay resultados de evaluacion publicados en la informacion disponible, por lo que la calidad real no esta cuantificada.
- Estado del repositorio: con 0 descargas en el momento de los datos, no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/zerolabllc/TeaAI-Nemo-12B-mini-GGUF
- Modelo base en HuggingFace: https://huggingface.co/zerolabllc/TeaAI-Nemo-12B
- Perfil del autor: https://huggingface.co/zerolabllc
- Paper, blog o repositorio adicionales: no disponibles en la informacion proporcionada.
