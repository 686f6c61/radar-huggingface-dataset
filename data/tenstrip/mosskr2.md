# TenStrip/MOSSkr2

## Resumen

MOSSkr2 es un modelo de difusion para generacion de imagenes publicado por TenStrip en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un injerto (graft) de atencion y MLP aplicado sobre OpenMOSS-Team/MOSS-Image-SFT: el autor transfiere patrones de atencion Q + K y de compuertas MLP procedentes de otro modelo (Krea2) al modelo base, sin anadir datos ni pesos nuevos y sin ejecutar entrenamiento adicional. El resultado es un ajuste no destructivo que modifica el comportamiento de atencion del modelo base.

El autor describe el resultado como una inyeccion de ruido estetico estructurado mas que como un injerto plenamente alineado, y advierte que el modelo sigue necesitando alineacion real. Los efectos reportados incluyen mayor detalle, mejora en composiciones de fondo, mas contraste y saturacion, y mejor rendimiento con prompts poco refinados en comparacion con el SFT en int8. El repositorio ocupa 15,8 GB y se distribuye como archivo unico para la libreria `diffusion-single-file`.

La relevancia del modelo es acotada y experimental: demuestra una tecnica de modificacion de comportamiento por transferencia de patrones de atencion sin entrenamiento, aplicable a modelos de difusion de imagen. No dispone de model card estandar con especificaciones tecnicas, benchmarks ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (hereda la de OpenMOSS-Team/MOSS-Image-SFT); el autor no detalla la arquitectura interna |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible; el autor menciona comparaciones con el SFT en int8 |
| Idiomas soportados | no disponible (modelo de generacion de imagen; los prompts se infieren del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | archivo unico para `diffusion-single-file` (repo de 15,8 GB) |

## Arquitectura y entrenamiento

MOSSkr2 no incorpora entrenamiento. Segun el autor, se trata de un injerto de atencion Q + K y de compuertas MLP (gate/up) procedente de Krea2 sobre MOSS-Image-SFT. No se anaden datos ni pesos y el objetivo no es que el modelo genere como Krea2, sino que su atencion se comporte de forma influida por la de Krea2, lo que provoca que MOSS "tokenice" ligeramente de forma similar. El autor lo compara con un Lora de detalle sutil y otro de ajuste de niveles aplicados a lo largo de todo el modelo, sin interferir con prompts ni semillas.

La tecnica es no destructiva respecto a los injertos: no requiere entrenamiento y, segun el autor, el principal problema es el error compuesto a partir de las primeras capas cuando la alineacion es deficiente. El autor indica que preve revisar el enfoque con Zimage y un sesgo de profundidad mayor. No se especifican datos de entrenamiento, numero de tokens, composicion del dataset ni uso de RLHF/DPO, porque no hubo entrenamiento.

## Capacidades

- Generacion de imagenes a partir de prompts de texto, heredando la capacidad del modelo base MOSS-Image-SFT.
- Mayor nivel de detalle en las imagenes generadas respecto al SFT en int8, segun el autor.
- Mejora en composiciones de fondo en comparacion con el modelo base.
- Mayor contraste y saturacion, compensando lo que el autor percibe como un base excesivamente desaturado y plano.
- Cambios notables en composicion y detalles de personajes; el autor menciona comportamientos heredados de Krea2, como la forma de generar pendientes.
- Compatibilidad con el primer DMD turbo a fuerza reducida (0,7-0,8) y con 8-12 pasos.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo de difusion de imagen.

## Casos de uso

- Generacion de arte e ilustracion estilo anime: el autor reporta resultados mas nitidos y coloridos que el base, adecuado para producir ilustraciones con detalle fino a partir de prompts descriptivos.
- Composicion de escenas con fondos complejos: la mejora reportada en composiciones de fondo lo hace util para escenas con multiples elementos y profundidad.
- Prototipado rapido con pocos pasos: combinado con DMD turbo a fuerza 0,7-0,8 y 8-12 pasos, permite iterar bocetos con latencia baja.
- Trabajo con prompts poco refinados: el autor indica mejora general sobre el SFT en int8 en prompts que no funcionan bien en el base, util para flujos exploratorios.
- Ajuste estetico sin reentrenar: sirve como capa de estilo no destructiva sobre MOSS-Image-SFT cuando no se quiere reentrenar ni aplicar LoRAs adicionales.
- Experimentacion en investigacion sobre injertos de atencion: util como caso de estudio de transferencia de patrones de atencion entre modelos de difusion sin entrenamiento.
- Generacion de variaciones controladas por semilla: el autor afirma que el injerto no interfiere con prompts ni semillas, lo que facilita reproducir composiciones y variar solo el estilo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo ofrece valoraciones cualitativas (mejora de detalle, color y fondos; paridad con las primeras versiones de DMD turbo a fuerza 0,7-0,8 con 8-12 pasos) sin metricas numericas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio pesa 15,8 GB en un unico archivo, por lo que se requiere al menos esa cantidad de memoria o cuantizacion para cargarlo.
- GPU recomendadas: no disponible; por tamano del archivo, se necesita una GPU con 16 GB o mas de VRAM para cargar los pesos completos.
- GPU de consumo: probablemente viable en tarjetas con 16-24 GB (por ejemplo, RTX 4080/4090) si el formato y la cuantizacion lo permiten; no confirmado por el autor.
- Opciones de despliegue: el autor no especifica; al ser un archivo unico para `diffusion-single-file`, se integra en los flujos que aceptan este formato. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a difusion de imagen).
- Latencia y throughput: no disponibles; el autor menciona uso con 8-12 pasos junto a DMD turbo, lo que reduce el coste de inferencia frente a muestreos largos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TenStrip/MOSSkr2 | no disponible | no aplica | cualitativo: mas detalle, color y fondos que el SFT int8 (autor) | Apache 2.0 | Hugging Face, 2064 descargas, 22 likes |
| OpenMOSS-Team/MOSS-Image-SFT (base) | no disponible | no aplica | referencia del injerto; el autor lo considera mas plano y desaturado | no disponible en la informacion | Hugging Face |
| Krea2 (donante de atencion) | no disponible | no aplica | no comparable directamente; solo aporta patrones de atencion | no disponible en la informacion | no disponible en la informacion |

## Limitaciones y advertencias

- El propio autor indica que el modelo sigue necesitando alineacion real y que se trata mas de una inyeccion de ruido estetico estructurado que de un injerto funcional.
- El error compuesto a partir de las primeras capas es el principal problema del injerto cuando la alineacion es deficiente, segun el autor.
- No hay entrenamiento ni datos nuevos: los resultados dependen del comportamiento del modelo base y pueden ser inconsistentes entre prompts.
- No se han publicado benchmarks, por lo que las mejoras son afirmaciones cualitativas del autor y no estan verificadas de forma independiente.
- No se documentan sesgos conocidos, riesgo de alucinacion (no aplica en el sentido textual) ni limitaciones de idioma.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de MOSS-Image-SFT conviene verificar las condiciones del modelo base antes de produccion.
- Modelo experimental con pocas descargas (2064) y publicacion reciente; no recomendado como dependencia estable en produccion sin evaluacion propia.
- El autor advierte que preve revisar el enfoque con otro modelo y mayor sesgo de profundidad, lo que sugiere que esta version es provisional.

## Enlaces

- Hugging Face: https://huggingface.co/TenStrip/MOSSkr2
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
