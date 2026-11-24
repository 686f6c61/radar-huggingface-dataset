# wxlei2004/mexc-zero-fee-perp-scalper-bot

## Resumen

El repositorio `wxlei2004/mexc-zero-fee-perp-scalper-bot` alojado en Hugging Face no contiene un modelo de inteligencia artificial. Se trata de una publicacion que empaqueta un supuesto bot de trading para futuros perpetuos de MEXC, distribuido como ejecutable para Windows 10 y Windows 11, y presentado con etiquetas propias de modelos (`license:mit`, lista de idiomas) que no se corresponden con el contenido real. No existe pipeline declarado, no hay pesos, no hay arquitectura de red neuronal ni tokenizador.

La model card describe caracteristicas de un supuesto programa de scalping (enrutado de ordenes, filtro de honeypot, boveda de claves AES-256, sandbox de paper trading) y redirige la descarga a un archivo ZIP alojado en un repositorio de GitHub de terceros, protegido con contrasena. El nombre del ejecutable y del archivo comprimido (`monster-hunter-wilds-trainer-mod-v1.2.2-win64.exe/.zip`) no guarda relacion con el titulo del proyecto, lo que constituye una senal de alarma clara sobre la procedencia y la integridad del binario.

Desde el punto de vista de evaluacion de modelos, esta ficha no puede emitir juicios tecnicos sobre capacidades, rendimiento o calidad, porque no hay modelo que evaluar. El interes de documentarlo es, precisamente, advertir de que se trata de un artefacto ajeno al ecosistema de IA open source que utiliza el formato de model card para distribuir software ejecutable de procedencia dudosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; se distribuye un ejecutable para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas declaradas, no verificables) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` de Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo. La model card describe un programa de trading con componentes funcionales declarados: enrutado de ordenes por WebSocket y gRPC con sondeo a 372 Hz, filtro de honeypot previo a la compra, agrupacion de 20 carteras mediante Lookup Tables, sandbox de paper trading, boveda local de claves AES-256 y take profit multinivel. Ninguna de estas afirmaciones viene acompanada de codigo fuente, binarios verificables ni resultados reproducibles.

No se declara ningun proceso de entrenamiento, dataset, tokenizador, tecnica de alineacion (RLHF, DPO) ni innovacion en el plano de machine learning. El contenido es, en la practica, material promocional de un ejecutable.

## Capacidades

- No aplica: no hay generacion de texto, razonamiento, codigo, matematicas ni vision.
- No hay soporte de tool calling ni function calling en el sentido de un LLM.
- No hay capacidades de agente ni razonamiento multi-paso.
- Las capacidades multilingues son solo etiquetas de metadatos, sin modelo que las sustente.
- Las funciones descritas (scalping, gestion de carteras, firma local) pertenecen a un supuesto bot de trading y no se pueden verificar.

## Casos de uso

- No procede evaluar casos de uso de IA: el artefacto no es un modelo y no ofrece inferencia.
- Auditoria de seguridad: un equipo puede analizar el binario en un entorno aislado para determinar si el ejecutable realiza acciones maliciosas, dado el desajuste entre el titulo del proyecto y el nombre del archivo distribuido.
- Formacion en deteccion de fraude: el repositorio sirve como ejemplo practico de model card falsificada que imita metadatos de Hugging Face para distribuir software.
- Monitorizacion de la plataforma: util para estudiar patrones de abuso del formato de model card y mejorar los filtros de publicacion.
- Analisis de cadena de suministro: revisar la trazabilidad entre el repositorio de Hugging Face y el repositorio de GitHub de destino de la descarga.
- Documentacion de incidentes: registrar el caso en bases de datos de repositorios sospechosos para advertir a otros usuarios.

En ningun caso se recomienda su ejecucion en un equipo de produccion ni en una maquina con credenciales o carteras reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica VRAM ni GPU: no hay modelo que ejecutar.
- El artefacto declarado es un ejecutable para Windows 10 y Windows 11 en arquitectura x64.
- Tamano del archivo comprimido declarado: 4,8 MB.
- Consumo de memoria declarado por el autor: menos de 46 MB de RAM (no verificable).
- Opciones de despliegue tipo vLLM, llama.cpp, Ollama o TGI: no aplican.
- Latencia y throughput de inferencia: no disponibles.

## Comparativa con modelos similares

No disponible. No existe categoria de modelos comparable porque el artefacto no es un modelo de IA. Frente a repositorios legitimos de modelos, la diferencia esencial es la ausencia de pesos, configuracion, tokenizador y resultados reproducibles.

## Limitaciones y advertencias

- No es un modelo de IA: la model card imita el formato de Hugging Face pero distribuye software ejecutable.
- Desajuste de nombres: el ejecutable y el ZIP se denominan `monster-hunter-wilds-trainer-mod-v1.2.2-win64`, sin relacion con el titulo del proyecto.
- Distribucion mediante enlace externo a GitHub con contrasena en el propio texto: practica habitual en campanas de malware.
- Cero descargas y cero likes en el momento de la consulta, lo que impide cualquier validacion por parte de la comunidad.
- La licencia MIT declarada no garantiza la legitimidad ni la seguridad del binario.
- Riesgo alto de robo de credenciales o de claves de exchange si se ejecuta con permisos de administrador, tal como indica el propio instructivo.
- No se debe ejecutar en equipos con acceso a carteras de criptomonedas, exchanges o datos sensibles.
- No hay evidencia de que las funciones descritas (enrutado sub-40 ms, boveda AES-256, filtro de honeypot) existan realmente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/wxlei2004/mexc-zero-fee-perp-scalper-bot
- Repositorio de GitHub referenciado en la model card para la descarga: https://github.com/jgonzalez740/mexc-zero-fee-perp-scalper-bot
- Repositorio de GitHub que aloja el archivo ZIP: https://github.com/Giovanni9790/monster-hunter-wilds-trainer-mod/releases/download/v1.2.0/monster-hunter-wilds-trainer-mod-v1.2.2-win64.zip
- Paper, blog o demo: no disponible
